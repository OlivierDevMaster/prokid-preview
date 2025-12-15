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
   - Determines if new availabilities need to be created (to represent blocked periods)
3. Returns a result with:
   - Availabilities that need to be updated (with their new RRULE configurations)
   - Availabilities that need to be created (new blocked periods)

**Availability Subtraction Pattern:**

All cases follow the same pattern - the mission period is "subtracted" from the availability:

1. **Update Original**: Stop the original availability before the mission starts (set UNTIL to just before first mission occurrence)
2. **During Mission** (if applicable): Create availability for non-blocked parts during the mission period (with UNTIL = mission end)
3. **After Mission**: Create availability for the full pattern starting after the mission ends, preserving the original UNTIL if it existed

This ensures that:
- **Before mission**: Original availability continues until just before the mission
- **During mission**: Professional is available only for non-blocked parts (mission period is subtracted)
- **After mission**: Full availability pattern resumes (continues indefinitely or until original UNTIL)

## Visual Examples

### Example 1: Mission in the Middle of Availability

**Original Availability:**
```
Every Monday 9am-12pm (ongoing)
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|
Date:  Jan 1                Jan 8                Jan 15               Jan 22
```

**Mission Scheduled:**
```
Every Monday 10am-11am (Jan 8 - Jan 31)
Time:  |===== 9am-12pm =====|  |== 9am-10am ==|--MISSION--|== 11am-12pm ==|  ...
Date:  Jan 1                Jan 8            Jan 8        Jan 8          Jan 8
```

**Result: Availability Subtraction**

1. **Updated Original** (stops before mission):
```
Time:  |===== 9am-12pm =====|  |== 9am-10am ==|  (stops here)
Date:  Jan 1                Jan 8            Jan 8 (UNTIL: just before 10am)
```

2. **Created: During Mission** (11am-12pm, only during mission period):
```
Time:  |== 11am-12pm ==|  |== 11am-12pm ==|  |== 11am-12pm ==|  (stops)
Date:  Jan 8           Jan 15            Jan 22           Jan 29 (UNTIL: Jan 31)
```

3. **Created: After Mission** (full 9am-12pm, resumes after mission ends):
```
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|  ...
Date:  Feb 5               Feb 12              Feb 19              (ongoing)
```

**Final Result Timeline:**
```
Before Mission:  |===== 9am-12pm =====|  (original, stops before Jan 8)
During Mission:  |== 9am-10am ==|--MISSION--|== 11am-12pm ==|  (split availability)
After Mission:   |===== 9am-12pm =====|  |===== 9am-12pm =====|  ... (resumes full)
```

### Example 2: Mission at Start of Availability

**Original Availability:**
```
Every Monday 9am-12pm (ongoing)
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|
Date:  Jan 1                Jan 8                Jan 15               Jan 22
```

**Mission Scheduled:**
```
Every Monday 9am-10am (Jan 8 - Jan 31)
Time:  |===== 9am-12pm =====|  |--MISSION--|== 10am-12pm ==|  ...
Date:  Jan 1                Jan 8        Jan 8          Jan 8
```

**Result: Availability Subtraction**

1. **Updated Original** (stops before mission):
```
Time:  |===== 9am-12pm =====|  (stops here)
Date:  Jan 1                Jan 8 (UNTIL: just before 9am)
```

2. **Created: During Mission** (10am-12pm, only during mission period):
```
Time:  |== 10am-12pm ==|  |== 10am-12pm ==|  |== 10am-12pm ==|  (stops)
Date:  Jan 8           Jan 15            Jan 22           Jan 29 (UNTIL: Jan 31)
```

3. **Created: After Mission** (full 9am-12pm, resumes after mission ends):
```
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|  ...
Date:  Feb 5               Feb 12              Feb 19              (ongoing)
```

**Final Result Timeline:**
```
Before Mission:  |===== 9am-12pm =====|  (original, stops before Jan 8)
During Mission:  |--MISSION--|== 10am-12pm ==|  (partial availability)
After Mission:   |===== 9am-12pm =====|  |===== 9am-12pm =====|  ... (resumes full)
```

### Example 3: Mission at End of Availability

**Original Availability:**
```
Every Monday 9am-12pm (ongoing)
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|
Date:  Jan 1                Jan 8                Jan 15               Jan 22
```

**Mission Scheduled:**
```
Every Monday 11am-12pm (Jan 8 - Jan 31)
Time:  |===== 9am-12pm =====|  |== 9am-11am ==|--MISSION--|  ...
Date:  Jan 1                Jan 8            Jan 8        Jan 8
```

**Result: Availability Subtraction**

1. **Updated Original** (stops before mission):
```
Time:  |===== 9am-12pm =====|  |== 9am-11am ==|  (stops here)
Date:  Jan 1                Jan 8            Jan 8 (UNTIL: just before 11am)
```

2. **Created: After Mission** (full 9am-12pm, resumes after mission ends):
```
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|  ...
Date:  Feb 5               Feb 12              Feb 19              (ongoing)
```

**Final Result Timeline:**
```
Before Mission:  |===== 9am-12pm =====|  |== 9am-11am ==|  (original, stops before Jan 8)
During Mission:  |== 9am-11am ==|--MISSION--|  (partial availability during mission)
After Mission:   |===== 9am-12pm =====|  |===== 9am-12pm =====|  ... (resumes full)
```

### Example 4: Mission Covers Entire Availability

**Original Availability:**
```
Every Monday 9am-12pm (ongoing)
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|
Date:  Jan 1                Jan 8                Jan 15               Jan 22
```

**Mission Scheduled:**
```
Every Monday 9am-12pm (Jan 8 - Jan 31) - covers entire availability
Time:  |===== 9am-12pm =====|  |--MISSION--|  |--MISSION--|  ...
Date:  Jan 1                Jan 8        Jan 15       Jan 22
```

**Result: Availability Subtraction**

1. **Updated Original** (stops before mission):
```
Time:  |===== 9am-12pm =====|  (stops here)
Date:  Jan 1                Jan 8 (UNTIL: just before 9am)
```

2. **Created: After Mission** (full 9am-12pm, resumes after mission ends):
```
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|  ...
Date:  Feb 5               Feb 12              Feb 19              (ongoing)
```

**Final Result Timeline:**
```
Before Mission:  |===== 9am-12pm =====|  (original, stops before Jan 8)
During Mission:  |--MISSION--|  |--MISSION--|  (completely blocked)
After Mission:   |===== 9am-12pm =====|  |===== 9am-12pm =====|  ... (resumes full)
```

### Legend

- `=====` = Available time
- `--MISSION--` = Blocked time (mission period)
- `==` = Partial availability (split periods)

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

