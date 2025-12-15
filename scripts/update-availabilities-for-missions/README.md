# Update Availabilities for Missions

This module provides functionality to calculate which professional availabilities need to be updated or created when missions are scheduled. When a mission is scheduled, the professional's availabilities that correspond to the mission schedules should become unavailable during the mission period.

## Overview

The `updateAvailabilitiesForMissions` function analyzes professional availabilities and mission schedules to determine:
- Which existing availabilities need to be updated (split or modified to exclude mission periods)
- Which new availabilities need to be created (to represent the blocked time periods)

**Important:** This function assumes that all mission schedules have already been validated against professional availabilities using `validateMissionAvailability`. All schedules are expected to be within the professional's availability windows.

## Function

### `updateAvailabilitiesForMissions`

Calculates which availabilities need to be updated or created to block out mission periods.

**Process:**

1. Takes professional availabilities and missions with their schedules
2. For each mission schedule occurrence:
   - Finds the corresponding availability occurrences that cover it
   - Determines if the availability needs to be split (mission in the middle)
   - Determines if the availability needs to be truncated (mission at start/end)
   - Determines if a new availability needs to be created (to represent the blocked period)
3. Returns a result with:
   - Availabilities that need to be updated (with their new RRULE configurations)
   - Availabilities that need to be created (new blocked periods)

**Parameters:**

- `availabilities`: Array of professional availabilities with RRULE and duration
- `missionSchedules`: Array of mission schedules with RRULE and duration
- `missionDtstart`: Mission start date
- `missionUntil`: Mission end date

**Returns:**

- `AvailabilityUpdateResult` with:
  - `toUpdate`: Array of availabilities that need to be updated
  - `toCreate`: Array of new availabilities that need to be created

## Notes

- This function does **not** perform the actual database updates - it only calculates what needs to be changed
- Availabilities are not deleted - setting `until` just stops the recurrence, and we maintain history
- The function assumes all mission schedules have been validated and are within professional availabilities
- The function handles complex scenarios including:
  - Missions that split availabilities in the middle
  - Missions at availability boundaries
  - Multiple missions affecting the same availability
  - Recurring missions with recurring availabilities

## Test Suite

The test suite will include comprehensive test cases covering various scenarios:

- Basic blocking scenarios
- Missions at availability boundaries
- Missions splitting availabilities
- Multiple missions affecting same availability
- Complex recurring patterns
- Edge cases

## Running Tests

To run the test suite:

```bash
npx tsx scripts/update-availabilities-for-missions/tests/test-runner.ts
```

## Usage Example

```typescript
import { updateAvailabilitiesForMissions } from './updateAvailabilitiesForMissions.ts';

const availabilities = [
  {
    duration_mn: 180,
    rrule: 'DTSTART:20240101T090000Z\nRRULE:FREQ=WEEKLY;BYWEEKDAY=MO',
  },
];

const missionSchedules = [
  {
    duration_mn: 60,
    rrule: 'DTSTART:20240108T100000Z\nRRULE:FREQ=WEEKLY;BYWEEKDAY=MO',
  },
];

const result = updateAvailabilitiesForMissions(
  availabilities,
  missionSchedules,
  new Date('2024-01-08T00:00:00Z'),
  new Date('2024-01-31T23:59:59Z')
);

// result.toUpdate contains availabilities that need modification
// result.toCreate contains new availabilities to create
```

