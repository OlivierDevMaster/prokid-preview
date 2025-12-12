# Mission Availability Validation

This module provides validation functionality to ensure that mission schedules fall within professional availabilities. The validation checks that all mission occurrences are fully contained within at least one availability occurrence.

## Overview

The `validateMissionAvailability` function validates that all occurrences generated from mission schedules are completely covered by at least one professional availability. This prevents creating missions that would conflict with a professional's stated availability.

**Important:** The function automatically constrains each mission schedule RRULE by the mission date range before validation. This ensures consistency with how RRULEs are stored in the database (via `constrainRRULEByDates` in `createMissionHandler`). The time from the original RRULE's DTSTART is preserved, but the date boundaries are set to match the mission's start and end dates.

## Function

### `validateMissionAvailability`

Validates that all mission schedule occurrences fall within at least one professional availability.

**Process:**

1. Constrains each mission schedule RRULE by mission date range (ensures consistency with stored data)
2. Generates all occurrences for each constrained mission schedule
3. Generates all occurrences for each professional availability
4. Checks that each mission occurrence is fully contained within at least one availability occurrence
5. Returns validation result with any violations found

**Parameters:**

- `missionSchedules`: Array of mission schedules with RRULE and duration
- `missionDtstart`: Mission start date
- `missionUntil`: Mission end date
- `availabilities`: Array of professional availabilities

**Returns:**

- `ValidationResult` with `isValid` flag and array of `violations` (if any)

## Test Suite

The test suite includes 21 comprehensive test cases covering various scenarios:

### Basic Validation Cases

1. **should validate mission fully within single availability**
   - Tests that a mission occurrence completely within an availability is valid
   - Mission: Every Monday 10am-11am within Availability: Every Monday 9am-12pm

2. **should reject mission that starts before availability**
   - Tests that a mission starting before availability start time is rejected
   - Mission: Every Monday 9am-11am vs Availability: Every Monday 10am-12pm

3. **should reject mission that ends after availability**
   - Tests that a mission ending after availability end time is rejected
   - Mission: Every Monday 9am-12pm vs Availability: Every Monday 9am-11am

4. **should validate mission at exact availability boundaries**
   - Tests that a mission matching availability exactly is valid
   - Mission: Every Monday 9am-12pm matches Availability: Every Monday 9am-12pm

### Multiple Schedules and Availabilities

5. **should validate mission with multiple schedules against multiple availabilities**
   - Tests validation with multiple mission schedules and multiple availabilities
   - Schedule 1: Every Monday 10am-11am (covered by Availability 1)
   - Schedule 2: Every Wednesday 15pm-16pm (covered by Availability 2)

6. **should reject mission if one schedule is not covered**
   - Tests that if any schedule is not covered, validation fails
   - Schedule 1: Every Monday 10am-11am (covered)
   - Schedule 2: Every Tuesday 10am-11am (not covered)

### Overlapping Availabilities

7. **should validate mission covered by overlapping availabilities**
   - Tests that a mission can be covered by overlapping availabilities
   - Availability 1: Every Monday 9am-12pm
   - Availability 2: Every Monday 10am-13pm (overlaps)
   - Mission: Every Monday 11am-12pm (covered by both)

### Date Range Constraints

8. **should validate mission within availability date range**
   - Tests validation when availability has a specific date range
   - Availability: Every Monday 9am-12pm, valid until end of January
   - Mission: Every Monday 10am-11am, within mission date range

9. **should reject mission outside availability date range**
   - Tests that missions extending beyond availability date range are rejected
   - Availability: Every Monday 9am-12pm, valid until Jan 15
   - Mission: Every Monday 10am-11am, extends to Jan 29

### Edge Cases

10. **should reject mission when no availabilities provided**
    - Tests that missions are rejected when no availabilities exist
    - Empty availabilities array

11. **should handle empty mission schedules array**
    - Tests that empty mission schedules array is valid
    - No schedules to validate

12. **should throw error for invalid mission date range**
    - Tests error handling for invalid date ranges
    - End date before start date

13. **should throw error for invalid RRULE in mission schedule**
    - Tests error handling for invalid RRULE strings
    - Invalid RRULE format

14. **should skip invalid availability RRULEs and continue validation**
    - Tests that invalid availability RRULEs are skipped gracefully
    - One valid and one invalid availability

### Different RRULE Frequencies

15. **should validate daily mission against daily availability**
    - Tests validation with daily recurring patterns
    - Daily availability and daily mission

16. **should validate mission with multiple days per week**
    - Tests validation with multiple weekdays
    - Availability: Monday, Wednesday, Friday 9am-12pm
    - Mission: Monday, Wednesday 10am-11am

### Time Boundary Cases

17. **should validate mission that starts exactly at availability start**
    - Tests exact boundary condition at start time
    - Mission start time equals availability start time

18. **should validate mission that ends exactly at availability end**
    - Tests exact boundary condition at end time
    - Mission end time equals availability end time

19. **should reject mission that extends 1 minute past availability**
    - Tests strict boundary enforcement
    - Mission duration 1 minute longer than availability

### Violation Details

20. **should provide detailed violation information**
    - Tests that violations include detailed information
    - Violation includes: schedule index, start time, end time, and reason

21. **should constrain mission schedule RRULE by mission date range**
    - Tests that RRULEs extending beyond mission date range are properly constrained
    - Verifies constraint behavior matches database storage logic
    - Mission RRULE extends to Dec 31, but mission ends Jan 31 - only Jan occurrences are validated

## Running Tests

To run the test suite:

```bash
npx tsx scripts/missions-availability/validateMissionAvailability.test.ts
```

## Usage Example

```typescript
import { validateMissionAvailability } from './validateMissionAvailability.ts';

const missionSchedules = [
  {
    duration_mn: 60,
    rrule: 'DTSTART:20240108T100000Z\nRRULE:FREQ=WEEKLY;BYWEEKDAY=MO',
  },
];

const availabilities = [
  {
    duration_mn: 180,
    rrule: 'DTSTART:20240101T090000Z\nRRULE:FREQ=WEEKLY;BYWEEKDAY=MO',
  },
];

const result = validateMissionAvailability(
  missionSchedules,
  new Date('2024-01-08T00:00:00Z'),
  new Date('2024-01-31T23:59:59Z'),
  availabilities
);

if (!result.isValid) {
  console.error('Validation failed:', result.violations);
}
```

## Notes

- **RRULE Constraint:** Mission schedule RRULEs are automatically constrained by the mission date range before validation. The time from the original RRULE's DTSTART is preserved, but the date boundaries are set to match `missionDtstart` and `missionUntil`. This ensures validation matches what will be stored in the database.
- The validation ensures **no overlapping** - all mission occurrences must be fully contained within at least one availability
- The function uses the `rrule` library for RRULE parsing and occurrence generation
- Invalid availability RRULEs are skipped (logged but don't stop validation)
- Invalid mission schedule RRULEs throw errors (critical failures)
- The validation checks that mission start >= availability start AND mission end <= availability end
