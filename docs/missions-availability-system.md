# Missions and Availability System

## Overview

The mission system allows structures to create recurring missions for professionals by providing RRULE patterns directly. The frontend suggests professional availabilities, but structures can create custom RRULEs for any time slot. The backend constrains all RRULEs by the mission's date range.

## Architecture

### Key Concepts

1. **Availabilities**: Professional-defined recurring time slots (e.g., "Every Monday 9am-12pm") - used as frontend suggestions only
2. **Missions**: Structure-created assignments with one or more RRULE schedules
3. **Mission Schedules**: RRULE patterns provided by frontend, constrained by mission dates

### Data Flow

```
Frontend suggests professional availabilities
    ↓
Structure selects availabilities OR creates custom RRULEs
    ↓
Frontend sends RRULEs + mission dates to backend
    ↓
Backend constrains RRULEs by mission dates
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
├── status (mission_status) - pending, accepted, declined, cancelled, expired
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

Stores RRULE patterns provided by the frontend:

```sql
mission_schedules
├── id (UUID)
├── mission_id (UUID) - Reference to mission
├── rrule (TEXT) - RRULE string (constrained by mission dates)
├── duration_mn (INTEGER) - Duration in minutes
├── dtstart (TIMESTAMP) - Extracted from rrule
├── until (TIMESTAMP) - Extracted from rrule
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Key Points:**

- Each schedule is a complete RRULE (can be queried directly)
- `rrule` is provided by frontend and constrained by mission dates
- `duration_mn` is provided by frontend
- No reference to availabilities (frontend-only suggestions)

## RRULE Constraint Process

### Process

When a mission is created, the system:

1. **Receives RRULEs** directly from the frontend (in `schedules` array)
2. **For each RRULE:**
   - Validates RRULE format using `rrulestr()`
   - Extracts the time from RRULE's DTSTART
   - Creates new DTSTART: `mission_dtstart` date + original time
   - Creates new UNTIL: `mission_until` date + original time
   - Preserves EXDATE exceptions from original RRULE
   - Combines into constrained RRULE string

### Example

**Frontend sends:**

```
DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO
```

**Mission Dates:**

- Start: 2024-06-01
- End: 2024-12-31

**Constrained Schedule:**

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
  "schedules": [
    {
      "rrule": "DTSTART:20240601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO",
      "duration_mn": 120
    },
    {
      "rrule": "DTSTART:20240601T140000Z\nRRULE:FREQ=WEEKLY;BYDAY=WE",
      "duration_mn": 180
    }
  ],
  "mission_dtstart": "2024-06-01T00:00:00Z",
  "mission_until": "2024-12-31T23:59:59Z",
  "status": "pending"
}
```

**Process:**

1. Validates structure and professional membership
2. Validates RRULE format for each schedule
3. Constrains each RRULE by mission dates
4. Checks for overlaps with accepted missions
5. Creates mission record
6. Creates mission_schedules records

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

- Structures can create missions with any RRULE pattern
- Frontend suggests availabilities but allows custom times
- Mission dates constrain all schedules uniformly
- Professionals can accept missions outside their stated availability

### 2. Query Performance

- Each schedule is a complete RRULE (no joins needed)
- Can generate occurrences directly from schedule.rrule
- Indexed on dtstart and until for date range queries

### 3. Maintainability

- Clear separation: mission metadata vs. schedule patterns
- Backend focuses on data integrity (validation, constraints, conflicts)
- Frontend handles UX (suggestions, warnings, RRULE building)
- Easy to add day-offs (EXDATE) in the future

### 4. Data Integrity

- Mission must have at least one schedule (enforced at application level)
- RRULEs are validated before storage
- RLS policies ensure proper access control

## Mission Status and Auto-Expiration

### Status Values

Missions can have the following statuses:

- **pending**: Mission has been created but not yet accepted or declined by the professional
- **accepted**: Professional has accepted the mission
- **declined**: Professional has declined the mission
- **cancelled**: Structure has cancelled the mission
- **expired**: Mission start date has passed and professional did not accept or decline it

### Auto-Expiration

Missions with `status = 'pending'` are automatically expired when their start date (`mission_dtstart`) has passed. This happens via a scheduled database function that runs hourly.

**Process:**

1. A cron job runs every hour (at minute 0)
2. The `expire_pending_missions()` function is executed
3. All missions where `status = 'pending'` AND `mission_dtstart < NOW()` are updated to `status = 'expired'`
4. The `updated_at` timestamp is also updated

**Status Transition Rules:**

- ✅ `pending` → `expired` (allowed by auto-expiration function)
- ❌ `expired` → any other status (blocked - expired is final)
- ❌ `accepted`/`declined`/`cancelled` → `expired` (blocked)
- ❌ `expired` → `pending` (blocked)

Once a mission is expired, it cannot be changed to any other status, similar to accepted or declined missions.

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
- `mission_schedules.availability_id` removed
- New required fields: `mission_dtstart`, `mission_until`
- API now requires `schedules` array with `rrule` and `duration_mn` instead of `availability_ids`

### Data Migration

If migrating existing missions:

1. Extract availability patterns from old `rrule`
2. Create corresponding `mission_schedules` entries
3. Set `mission_dtstart` and `mission_until` from old `dtstart`/`until`

## Related Files

- **Migration**: `supabase/migrations/20251209025545_create_missions.sql`
- **RRULE Constraint Utility**: `supabase/functions/_shared/utils/rrule-generator.ts` (constrainRRULEByDates function)
- **Create Handler**: `supabase/functions/missions/handlers/createMissionHandler.ts`
- **Accept Handler**: `supabase/functions/missions/handlers/acceptMissionHandler.ts`
- **Schema**: `supabase/functions/_shared/features/missions/mission.schema.ts`
