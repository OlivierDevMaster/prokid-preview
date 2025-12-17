# Mission Durations Handler

## Overview

The `getMissionDurationsHandler` calculates the total, past, and future mission durations for a professional within a specific structure. This enables progress tracking by showing how much mission time has been completed versus how much remains.

## Purpose

This handler provides duration metrics that can be used to:
- Display progress bars for professional memberships in structures
- Track completed vs remaining mission time
- Calculate completion percentages for mission assignments

## Endpoint

**Route**: `GET /mission-durations`

**Query Parameters**:
- `professional_id` (required): UUID of the professional
- `structure_id` (required): UUID of the structure

**Authentication**: Required (user must be either the professional or the structure)

## How It Works

### 1. Authentication & Authorization

The handler verifies:
- User is authenticated
- User is either:
  - The professional themselves, OR
  - The structure that created the missions
- Professional is an active member of the structure (not soft-deleted)

### 2. Mission Retrieval

Fetches all missions for the professional in the structure, excluding:
- `declined` missions
- `cancelled` missions

Only `pending` and `accepted` missions are included in the calculation.

### 3. Schedule Processing

For each mission:
1. Fetches all `mission_schedules` associated with the mission
2. For each schedule:
   - Parses the RRULE string to generate all occurrence dates
   - Constrains the RRULE by the mission's date range (`mission_dtstart` to `mission_until`)
   - Generates all occurrences between the mission start and end dates

### 4. Duration Calculation

For each schedule:
1. **Total Duration**: `occurrences.length × duration_mn`
2. **Past Duration**: `pastOccurrences.length × duration_mn` (occurrences before current date/time)
3. **Future Duration**: `futureOccurrences.length × duration_mn` (occurrences at or after current date/time)

Occurrences are split by the current date/time (`new Date()`):
- **Past**: `occurrence < now`
- **Future**: `occurrence >= now`

### 5. Aggregation

All durations are aggregated across:
- All missions for the professional in the structure
- All schedules within each mission

## Response Format

```typescript
{
  total_duration_mn: number;    // Total duration of all missions (minutes)
  past_duration_mn: number;     // Duration of completed occurrences (minutes)
  future_duration_mn: number;   // Duration of remaining occurrences (minutes)
}
```

### Example Response

```json
{
  "total_duration_mn": 480,
  "past_duration_mn": 240,
  "future_duration_mn": 240
}
```

This indicates:
- Total mission time: 8 hours (480 minutes)
- Completed: 4 hours (240 minutes)
- Remaining: 4 hours (240 minutes)
- Progress: 50% complete

## RRULE Processing

The handler uses the same RRULE processing logic as mission creation to ensure consistency:

1. **Constraining**: Each schedule's RRULE is constrained by the mission's date range
2. **Time Preservation**: The original time from the RRULE's DTSTART is preserved
3. **EXDATE Support**: Exception dates (EXDATE) in RRULEs are preserved
4. **Occurrence Generation**: All valid occurrences are generated between `mission_dtstart` and `mission_until`

### RRULE Constraints

- If RRULE's DTSTART is before mission start: constrained to mission start (time preserved)
- If RRULE's UNTIL is after mission end: constrained to mission end
- EXDATE exceptions are preserved from the original RRULE

## Error Handling

The handler handles various error scenarios:

1. **Missing Parameters**: Returns `400 Bad Request` if `professional_id` or `structure_id` is missing
2. **Unauthorized Access**: Returns `401 Unauthorized` if user is not authenticated
3. **Forbidden Access**: Returns `403 Forbidden` if user is not the professional or structure
4. **Not a Member**: Returns `400 Bad Request` if professional is not a member of the structure
5. **Database Errors**: Returns `500 Internal Server Error` with error details
6. **Invalid RRULEs**: Logs error and continues processing other schedules (graceful degradation)

### Graceful Degradation

- If a mission has no schedules: skipped (0 duration)
- If a schedule has an invalid RRULE: error logged, schedule skipped, processing continues
- If fetching schedules fails for a mission: error logged, mission skipped, processing continues

## Edge Cases

1. **No Missions**: Returns all durations as `0`
2. **Missions with No Schedules**: These missions contribute `0` to all duration totals
3. **All Occurrences in Past**: `future_duration_mn` will be `0`
4. **All Occurrences in Future**: `past_duration_mn` will be `0`
5. **Missions Outside Date Range**: Only occurrences within `mission_dtstart` and `mission_until` are counted

## Performance Considerations

- Processes all missions and schedules synchronously
- For large numbers of missions/schedules, consider:
  - Caching results
  - Implementing pagination if needed
  - Optimizing RRULE parsing if performance becomes an issue

## Usage Example

```typescript
// In a component
const { data: durations, isLoading } = useMissionDurations(
  professionalId,
  structureId
);

if (durations) {
  const progress = (durations.past_duration_mn / durations.total_duration_mn) * 100;
  console.log(`Progress: ${progress.toFixed(1)}%`);
  console.log(`Completed: ${durations.past_duration_mn} minutes`);
  console.log(`Remaining: ${durations.future_duration_mn} minutes`);
}
```

## Related Files

- **Edge Function Entry**: `supabase/functions/mission-durations/index.ts`
- **Service Layer**: `features/mission-durations/services/missionDuration.service.ts`
- **React Hook**: `features/mission-durations/hooks/useMissionDurations.ts`
- **Types**: `features/mission-durations/missionDuration.model.ts`

## Notes

- Durations are calculated in **minutes** (`duration_mn`)
- The current date/time is determined server-side at request time
- Only active memberships are considered (soft-deleted memberships are excluded)
- Mission status filtering ensures only relevant missions are included
