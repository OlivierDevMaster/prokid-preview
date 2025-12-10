# Missions and Availability System

## Overview

The mission system allows structures to create recurring missions for professionals by selecting from their available time slots. Each mission can reference multiple availability patterns, and the system automatically generates RRULE schedules constrained by the mission's date range.

## Architecture

### Key Concepts

1. **Availabilities**: Professional-defined recurring time slots (e.g., "Every Monday 9am-12pm")
2. **Missions**: Structure-created assignments that reference one or more availabilities
3. **Mission Schedules**: Generated RRULE patterns based on availabilities, constrained by mission dates

### Data Flow

```
Structure selects availabilities
    ↓
Structure provides mission dates (start/end)
    ↓
System generates RRULEs for each availability
    ↓
RRULEs are constrained by mission dates
    ↓
Mission and schedules are created
```

## Database Schema

### `missions` Table

Stores the mission metadata and date range:

```sql
missions
├── id (UUID)
├── structure_id (UUID) - Reference to structure
├── professional_id (UUID) - Reference to professional
├── title (TEXT)
├── description (TEXT)
├── status (mission_status) - pending, accepted, declined, cancelled
├── mission_dtstart (TIMESTAMP) - Mission start date
├── mission_until (TIMESTAMP) - Mission end date
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Key Points:**

- No longer stores `rrule` or `duration_mn` directly
- `mission_dtstart` and `mission_until` define the date range for all schedules
- Must have at least one schedule (enforced by constraint)

### `mission_schedules` Table

Stores the generated RRULE patterns for each availability:

```sql
mission_schedules
├── id (UUID)
├── mission_id (UUID) - Reference to mission
├── availability_id (UUID) - Reference to original availability
├── rrule (TEXT) - Generated RRULE string
├── duration_mn (INTEGER) - Duration in minutes
├── dtstart (TIMESTAMP) - Extracted from rrule
├── until (TIMESTAMP) - Extracted from rrule
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Key Points:**

- Each schedule is a complete RRULE (can be queried directly)
- `rrule` is generated from availability pattern + mission dates
- `duration_mn` is copied from the original availability
- `availability_id` tracks the source availability

## RRULE Generation

### Process

When a mission is created, the system:

1. **Fetches selected availabilities** from the `availabilities` table
2. **For each availability:**
   - Parses the availability's RRULE using `rrulestr()`
   - Extracts the recurrence pattern (FREQ, BYDAY, etc.)
   - Extracts the time from availability DTSTART
   - Creates new DTSTART: `mission_dtstart` date + availability time
   - Creates new UNTIL: `mission_until` date + availability time
   - Preserves EXDATE exceptions from availability
   - Combines into new RRULE string

### Example

**Availability:**

```
DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
```

**Mission Dates:**

- Start: 2024-06-01
- End: 2024-12-31

**Generated Schedule:**

```
DTSTART:20240601T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
UNTIL:20241231T090000Z
```

The schedule will generate occurrences every Monday at 9am between June 1 and December 31, 2024.

## API Usage

### Creating a Mission

**Endpoint:** `POST /api/missions`

**Request Body:**

```json
{
  "structure_id": "uuid",
  "professional_id": "uuid",
  "title": "Weekly Care Session",
  "description": "Regular care sessions",
  "availability_ids": ["availability-uuid-1", "availability-uuid-2"],
  "mission_dtstart": "2024-06-01T00:00:00Z",
  "mission_until": "2024-12-31T23:59:59Z",
  "status": "pending"
}
```

**Process:**

1. Validates structure and professional membership
2. Fetches selected availabilities
3. Verifies all availabilities belong to the professional
4. Generates RRULEs for each availability
5. Checks for overlaps with accepted missions
6. Creates mission record
7. Creates mission_schedules records

**Response:**

```json
{
  "id": "mission-uuid",
  "structure_id": "uuid",
  "professional_id": "uuid",
  "title": "Weekly Care Session",
  "description": "Regular care sessions",
  "status": "pending",
  "mission_dtstart": "2024-06-01T00:00:00Z",
  "mission_until": "2024-12-31T23:59:59Z",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Accepting a Mission

**Endpoint:** `POST /api/missions/:id/accept`

**Process:**

1. Verifies professional owns the mission
2. Checks mission is pending
3. Gets all mission schedules
4. Checks for overlaps with other accepted missions
5. Updates mission status to 'accepted'
6. Updates related availabilities with UNTIL dates

## Querying Mission Occurrences

### Using Mission Schedules

Each `mission_schedule` contains a complete RRULE that can be parsed directly:

```typescript
import { rrulestr } from 'rrule';

// Get mission with schedules
const { data: mission } = await supabase
  .from('missions')
  .select(
    `
    *,
    mission_schedules (*)
  `
  )
  .eq('id', missionId)
  .single();

// Generate occurrences for each schedule
for (const schedule of mission.mission_schedules) {
  const rule = rrulestr(schedule.rrule);
  const occurrences = rule.between(
    new Date(schedule.dtstart),
    new Date(schedule.until),
    true
  );

  // Each occurrence has:
  // - start: Date
  // - duration: schedule.duration_mn minutes
}
```

### Example: Get All Occurrences for a Mission

```typescript
async function getMissionOccurrences(missionId: string) {
  const { data: mission } = await supabase
    .from('missions')
    .select(
      `
      *,
      mission_schedules (*)
    `
    )
    .eq('id', missionId)
    .single();

  const allOccurrences: Array<{
    start: Date;
    duration_mn: number;
    schedule_id: string;
  }> = [];

  for (const schedule of mission.mission_schedules) {
    const rule = rrulestr(schedule.rrule);
    const occurrences = rule.between(
      new Date(schedule.dtstart),
      new Date(schedule.until),
      true
    );

    for (const occ of occurrences) {
      allOccurrences.push({
        start: occ,
        duration_mn: schedule.duration_mn,
        schedule_id: schedule.id,
      });
    }
  }

  return allOccurrences.sort((a, b) => a.start.getTime() - b.start.getTime());
}
```

## Overlap Detection

The system checks for overlaps when:

- Creating a new mission
- Accepting a pending mission

**Process:**

1. Gets all schedules for the new/pending mission
2. Gets all accepted missions with their schedules
3. For each new schedule:
   - Generates occurrences using `rule.between()`
   - For each accepted schedule:
     - Generates occurrences
     - Checks if any time ranges overlap
4. Returns conflict error if overlap found

**Overlap Logic:**

```typescript
// Two time ranges overlap if:
newOcc.getTime() < acceptedOccEnd.getTime() &&
  newOccEnd.getTime() > acceptedOcc.getTime();
```

Where:

- `newOcc`: Start of new occurrence
- `newOccEnd`: End of new occurrence (start + duration)
- `acceptedOcc`: Start of accepted occurrence
- `acceptedOccEnd`: End of accepted occurrence (start + duration)

## Benefits

### 1. Flexibility

- One mission can use multiple availability patterns
- Each pattern can have different times and durations
- Mission dates constrain all patterns uniformly

### 2. Query Performance

- Each schedule is a complete RRULE (no joins needed)
- Can generate occurrences directly from schedule.rrule
- Indexed on dtstart and until for date range queries

### 3. Maintainability

- Clear separation: mission metadata vs. schedule patterns
- Tracks source availability for auditing
- Easy to add day-offs (EXDATE) in the future

### 4. Data Integrity

- Mission must have at least one schedule
- Schedules reference valid availabilities
- RLS policies ensure proper access control

## Future Enhancements

### Day-Offs (EXDATE)

Structures can add EXDATE to mission schedules to exclude specific dates:

```typescript
// Add day-off to a schedule
const schedule = await getSchedule(scheduleId);
const rule = rrulestr(schedule.rrule);

// Add EXDATE for a specific date
const exdate = new Date('2024-07-04T09:00:00Z');
// Update schedule.rrule to include EXDATE
```

### Schedule Updates

Allow structures to modify generated RRULEs (currently read-only after creation).

## Migration Notes

### Breaking Changes

- `missions.rrule` and `missions.duration_mn` removed
- `missions.dtstart` and `missions.until` removed
- New required fields: `mission_dtstart`, `mission_until`
- API now requires `availability_ids` instead of `rrule`

### Data Migration

If migrating existing missions:

1. Extract availability patterns from old `rrule`
2. Create corresponding `mission_schedules` entries
3. Set `mission_dtstart` and `mission_until` from old `dtstart`/`until`

## Related Files

- **Migration**: `supabase/migrations/20251209025545_create_missions.sql`
- **RRULE Generator**: `supabase/functions/_shared/utils/rrule-generator.ts`
- **Create Handler**: `supabase/functions/missions/handlers/createMissionHandler.ts`
- **Accept Handler**: `supabase/functions/missions/handlers/acceptMissionHandler.ts`
- **Schema**: `supabase/functions/_shared/features/missions/mission.schema.ts`
