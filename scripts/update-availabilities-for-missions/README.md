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

All cases follow the same pattern - the schedule period is "subtracted" from the availability. The function uses the schedule's dtstart (A) and until (B) extracted from the schedule RRULE itself, not from the mission dates.

1. **Update Original**: Stop the original availability before the schedule starts (set UNTIL to just before schedule dtstart A)
2. **During Schedule Period** (if applicable): Create availabilities for non-blocked parts:
   - **Before mission part**: If mission doesn't start at availability start, create availability for the part before mission (dtstart = A, until = B)
   - **After mission part**: If mission doesn't end at availability end, create availability for the part after mission (dtstart = A, until = B)
3. **After Schedule Period**: Create availability for the full pattern starting after schedule until (B), preserving the original UNTIL if it existed (dtstart = B, until = original until)

This ensures that:
- **Before schedule**: Original availability continues until just before schedule dtstart (A)
- **During schedule period**: Professional is available only for non-blocked parts (schedule period is subtracted, using A and B from schedule RRULE)
- **After schedule period**: Full availability pattern resumes starting after schedule until (B), continues indefinitely or until original UNTIL

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

1. **Updated Original** (stops before schedule dtstart A):
```
Time:  |===== 9am-12pm =====|  (stops here)
Date:  Jan 1                Jan 8 (UNTIL: just before schedule dtstart A = Jan 8 10am)
```

2. **Created: Before Mission Part** (9am-10am, during schedule period, dtstart = A, until = B):
```
Time:  |== 9am-10am ==|  |== 9am-10am ==|  |== 9am-10am ==|  (stops)
Date:  Jan 8          Jan 15           Jan 22           Jan 29 (UNTIL: B = Jan 29 10am)
```

3. **Created: After Mission Part** (11am-12pm, during schedule period, dtstart = A, until = B):
```
Time:  |== 11am-12pm ==|  |== 11am-12pm ==|  |== 11am-12pm ==|  (stops)
Date:  Jan 8           Jan 15            Jan 22           Jan 29 (UNTIL: B = Jan 29 10am)
```

4. **Created: Post-Schedule** (full 9am-12pm, resumes after schedule until B):
```
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|  ...
Date:  Feb 5               Feb 12              Feb 19              (ongoing)
```

**Final Result Timeline:**
```
Before Schedule:  |===== 9am-12pm =====|  (original, stops before A = Jan 8 10am)
During Schedule:  |== 9am-10am ==|--MISSION--|== 11am-12pm ==|  (both parts: dtstart = A, until = B)
After Schedule:   |===== 9am-12pm =====|  |===== 9am-12pm =====|  ... (resumes full, dtstart = B)
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

1. **Updated Original** (stops before schedule dtstart A):
```
Time:  |===== 9am-12pm =====|  (stops here)
Date:  Jan 1                Jan 8 (UNTIL: just before schedule dtstart A = Jan 8 9am)
```

2. **Created: After Mission Part** (10am-12pm, during schedule period, dtstart = A, until = B):
```
Time:  |== 10am-12pm ==|  |== 10am-12pm ==|  |== 10am-12pm ==|  (stops)
Date:  Jan 8           Jan 15            Jan 22           Jan 29 (UNTIL: B = Jan 29 9am)
```

3. **Created: Post-Schedule** (full 9am-12pm, resumes after schedule until B):
```
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|  ...
Date:  Feb 5               Feb 12              Feb 19              (ongoing)
```

**Final Result Timeline:**
```
Before Schedule:  |===== 9am-12pm =====|  (original, stops before A = Jan 8 9am)
During Schedule:  |--MISSION--|== 10am-12pm ==|  (after mission part: dtstart = A, until = B)
After Schedule:   |===== 9am-12pm =====|  |===== 9am-12pm =====|  ... (resumes full, dtstart = B)
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

1. **Updated Original** (stops before schedule dtstart A):
```
Time:  |===== 9am-12pm =====|  (stops here)
Date:  Jan 1                Jan 8 (UNTIL: just before schedule dtstart A = Jan 8 11am)
```

2. **Created: Before Mission Part** (9am-11am, during schedule period, dtstart = A, until = B):
```
Time:  |== 9am-11am ==|  |== 9am-11am ==|  |== 9am-11am ==|  (stops)
Date:  Jan 8          Jan 15           Jan 22           Jan 29 (UNTIL: B = Jan 29 11am)
```

3. **Created: Post-Schedule** (full 9am-12pm, resumes after schedule until B):
```
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|  ...
Date:  Feb 5               Feb 12              Feb 19              (ongoing)
```

**Final Result Timeline:**
```
Before Schedule:  |===== 9am-12pm =====|  (original, stops before A = Jan 8 11am)
During Schedule:  |== 9am-11am ==|--MISSION--|  (before mission part: dtstart = A, until = B)
After Schedule:   |===== 9am-12pm =====|  |===== 9am-12pm =====|  ... (resumes full, dtstart = B)
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

1. **Updated Original** (stops before schedule dtstart A):
```
Time:  |===== 9am-12pm =====|  (stops here)
Date:  Jan 1                Jan 8 (UNTIL: just before schedule dtstart A = Jan 8 9am)
```

2. **Created: Post-Schedule** (full 9am-12pm, resumes after schedule until B):
```
Time:  |===== 9am-12pm =====|  |===== 9am-12pm =====|  |===== 9am-12pm =====|  ...
Date:  Feb 5               Feb 12              Feb 19              (ongoing)
```

**Final Result Timeline:**
```
Before Schedule:  |===== 9am-12pm =====|  (original, stops before A = Jan 8 9am)
During Schedule:  |--MISSION--|  |--MISSION--|  (completely blocked, dtstart = A, until = B)
After Schedule:   |===== 9am-12pm =====|  |===== 9am-12pm =====|  ... (resumes full, dtstart = B)
```

### Legend

- `=====` = Available time
- `--MISSION--` = Blocked time (mission period)
- `==` = Partial availability (split periods)

**Parameters:**

- `availabilities`: Array of professional availabilities with RRULE and duration
- `missionSchedules`: Array of mission schedules with RRULE and duration
- `missionDtstart`: Mission start date (from missions table)
- `missionUntil`: Mission end date (from missions table)

**Note:** The function extracts the schedule's dtstart (A) and until (B) from each schedule's RRULE string itself. These schedule dates (A and B) may differ from the mission dates - the schedule can start after the mission starts or end before the mission ends.

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

## Known Limitations & Future Improvements

The current implementation has several limitations that should be addressed in future versions:

### 1. Multiple Schedules Affecting the Same Availability ✅ FIXED

**Previous Issue**: The `processedAvailabilityIndices` set prevented processing the same availability more than once, even if multiple schedules overlapped it.

**Solution Implemented**:
- Removed the `processedAvailabilityIndices` check
- Implemented a two-pass approach:
  1. **First pass**: Collect all schedule periods that affect each availability, tracking the earliest schedule dtstart (A) and latest schedule until (B) across all schedules
  2. **Second pass**: Process each affected availability using consolidated schedule dates:
     - Original availability UNTIL is set to just before the **earliest** schedule dtstart (A)
     - Post-mission availability starts after the **latest** schedule until (B)
     - Each schedule creates its own "before mission" and "after mission" parts during its schedule period
     - Only one post-mission availability is created per availability (using the latest schedule until)

**Test Coverage**: Added 6 comprehensive test cases covering:
- Two schedules with different time periods
- Two overlapping schedules
- Schedule starting before another ends
- Three schedules affecting same availability
- Schedules with different patterns (different days)
- Schedule at start and schedule at end

### 2. Post-Mission Availability Duplication ✅ FIXED

**Previous Issue**: If multiple schedules affected the same availability, multiple post-mission availabilities could be created that should be merged.

**Solution Implemented**:
- Post-mission availability is now created only once per availability
- Uses the **latest** schedule until (B) across all schedules affecting the availability
- Deduplication check ensures only one post-mission availability is created per availability

### 3. Schedule Period Consolidation

**Current Approach**: Each schedule is processed independently.

**Proposed Solution**: Before processing, consolidate overlapping or adjacent schedule periods:
```typescript
// Pseudo-code
const consolidatedPeriods = consolidateSchedulePeriods(missionSchedules);
// Then process consolidated periods instead of individual schedules
```

This would ensure that overlapping schedules are handled correctly and reduce redundant calculations.

### 4. Occurrence-Level vs Schedule-Level Processing

**Current Approach**: Processes each mission occurrence individually.

**Proposed Improvement**: Process at the schedule level (using schedule dtstart/until) rather than occurrence-by-occurrence. This would:
- Reduce redundant calculations
- Ensure consistent behavior across all occurrences
- Simplify the logic

### 5. Edge Case: Overlapping Schedules with Different Patterns

**Scenario**:
- Availability: 9am-12pm daily
- Schedule 1: 10am-11am (Mon-Fri)
- Schedule 2: 10:30am-11:30am (Wed only)

The current logic might not handle this correctly.

**Proposed Solution**: Use a set-based approach:
1. Generate all availability occurrences
2. Generate all mission occurrences (from all schedules)
3. Subtract mission periods from availability periods
4. Group remaining periods by pattern and create/update accordingly

### 6. Performance Optimization

**Current**: Nested loops: `schedules → occurrences → availabilities → availability occurrences`

**Proposed Improvements**:
- Pre-generate all occurrences once
- Use interval trees or sorted arrays for overlap detection
- Batch process similar patterns

### 7. Validation and Error Handling

**Missing Validations**:
- Check if schedule until (B) is before schedule dtstart (A)
- Validate that schedule dates make sense
- Handle edge cases where schedule period is outside mission period

**Proposed Solution**: Add validation:
```typescript
if (scheduleUntil < scheduleDtstart) {
  // Handle invalid schedule
}
```

### 8. Alternative Approach: Interval Subtraction

**Proposed Alternative**: Consider an interval-based subtraction model:

```typescript
// Pseudo-code
1. Convert availability to intervals: [9am-12pm, recurring]
2. Convert mission schedules to intervals: [10am-11am, recurring]
3. Subtract mission intervals from availability intervals
4. Group remaining intervals by pattern
5. Create/update availabilities based on grouped intervals
```

**Benefits**:
- Handle multiple overlapping schedules naturally
- Avoid duplicate post-mission availabilities
- More mathematically sound
- Easier to test and reason about

### Priority Recommendations

1. **High Priority**: Fix multiple schedules issue (#1)
2. **High Priority**: Consolidate post-mission availabilities (#2)
3. **Medium Priority**: Add validation (#7)
4. **Medium Priority**: Consider interval-based approach (#8)
5. **Low Priority**: Performance optimization (#6)

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

