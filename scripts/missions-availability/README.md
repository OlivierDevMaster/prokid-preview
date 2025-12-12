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

The test suite includes **43 comprehensive test cases** covering various scenarios. Below is a detailed breakdown of test coverage, organized by category.

### Test Coverage Status

- ✓ = **Covered** - Test case exists and is passing
- ✗ = **Not Covered** - Test case does not exist yet

## Test Coverage

### 1. Basic Validation Cases

- ✓ **should validate mission fully within single availability** - Mission occurrence completely within an availability
- ✓ **should reject mission that starts before availability** - Mission starting before availability start time
- ✓ **should reject mission that ends after availability** - Mission ending after availability end time
- ✓ **should validate mission at exact availability boundaries** - Mission matching availability exactly
- ✓ **should validate mission schedule at start of availability window** - Mission at the beginning of availability
- ✓ **should validate mission schedule in middle of availability window** - Mission in the middle of availability
- ✓ **should validate mission schedule at end of availability window** - Mission at the end of availability

### 2. Multiple Schedules and Availabilities

- ✓ **should validate mission with multiple schedules against multiple availabilities** - Multiple schedules with multiple availabilities
- ✓ **should reject mission if one schedule is not covered** - Validation fails if any schedule is uncovered

### 3. Overlapping and Multi-Availability Coverage

- ✓ **should validate mission covered by overlapping availabilities** - Mission covered by overlapping availabilities
- ✓ **should validate mission schedule covered by multiple consecutive availabilities** - Mission 7am-10am covered by 7am-8am + 8am-10am
- ✓ **should validate mission schedule covered by multiple overlapping availabilities** - Mission covered by overlapping time ranges
- ✓ **should reject mission schedule partially covered by multiple availabilities** - Mission not fully covered by combination
- ✓ **should validate mission schedule covered by three consecutive availabilities** - Mission covered by three consecutive slots
- ✓ **should reject mission schedule with partial coverage across availabilities** - Gaps in multi-availability coverage
- ✓ **should validate mission schedule with gap between availabilities** - Mission fits in one availability despite gaps
- ✓ **should reject mission schedule spanning gap between availabilities** - Mission spans gap between availabilities
- ✓ **should validate multiple mission schedules with complex availability patterns** - Multiple schedules with complex patterns
- ✓ **should validate complex scenario with many schedules and many availabilities** - Large-scale scenario
- ✓ **should reject when one schedule in complex scenario is not covered** - One failure in complex scenario

### 4. Date Range Constraints

- ✓ **should validate mission within availability date range** - Mission within availability's date range
- ✓ **should reject mission outside availability date range** - Mission extending beyond availability date range

### 5. Availability Exceptions (UNTIL/EXDATE)

- ✓ **should reject mission when availability UNTIL stops mid-mission** - Availability stops before mission ends
- ✓ **should reject mission when availability has EXDATE during mission period** - Availability excludes dates during mission
- ✓ **should validate mission when availability EXDATE is outside mission period** - EXDATE doesn't affect mission period
- ✓ **should reject mission when one availability stops early in multi-availability scenario** - One availability stops early
- ✓ **should reject mission when availability has multiple EXDATEs during mission period** - Multiple excluded dates
- ✓ **should validate mission when availability UNTIL extends beyond mission period** - Availability extends beyond mission
- ✓ **should reject mission when availability with EXDATE creates gap in multi-availability coverage** - EXDATE creates coverage gap
- ✓ **should validate mission when availability has EXDATE but other availabilities cover it** - Other availabilities compensate
- ✓ **should reject mission when availability UNTIL creates partial coverage** - UNTIL causes partial coverage

### 6. Edge Cases and Error Handling

- ✓ **should reject mission when no availabilities provided** - Empty availabilities array
- ✓ **should handle empty mission schedules array** - Empty schedules array is valid
- ✓ **should throw error for invalid mission date range** - End date before start date
- ✓ **should throw error for invalid RRULE in mission schedule** - Invalid RRULE format in schedule
- ✓ **should skip invalid availability RRULEs and continue validation** - Invalid availability RRULEs are skipped

### 7. RRULE Frequencies

- ✓ **should validate daily mission against daily availability** - Daily recurring patterns
- ✓ **should validate mission with multiple days per week** - Multiple weekdays (MO, WE, FR)
- ✗ **Monthly frequency (MONTHLY)** - Mission/availability on same day each month
- ✗ **Yearly frequency (YEARLY)** - Mission/availability on same date each year
- ✗ **Hourly frequency (HOURLY)** - Recurring hourly patterns
- ✗ **Different intervals (INTERVAL=2, INTERVAL=3, etc.)** - Bi-weekly, every 3 weeks, etc.

### 8. RRULE BY* Modifiers

- ✗ **BYMONTH** - Specific months (e.g., only January, March, May)
- ✗ **BYMONTHDAY** - Specific days of month (e.g., 1st, 15th, last day)
- ✗ **BYWEEKNO** - Specific week numbers
- ✗ **BYYEARDAY** - Specific days of year
- ✗ **BYSETPOS** - Position in set (e.g., first Monday of month, last Friday)
- ✗ **Complex BY* combinations** - e.g., first Monday of every month, last Friday of quarter

### 9. Time Boundary Cases

- ✓ **should validate mission that starts exactly at availability start** - Exact boundary at start
- ✓ **should validate mission that ends exactly at availability end** - Exact boundary at end
- ✓ **should reject mission that extends 1 minute past availability** - 1 minute over boundary
- ✗ **Sub-minute boundaries** - Milliseconds, seconds precision
- ✗ **Zero-duration missions** - Should be rejected
- ✗ **Very short durations** - 1 minute, 30 seconds
- ✗ **Mission exactly 1 second before/after availability** - Second-level precision

### 10. Long-Duration Scenarios

- ✗ **Overnight missions** - e.g., 23:00-01:00 (spans midnight)
- ✗ **Multi-day missions** - Mission spanning 24+ hours
- ✗ **Multi-day availabilities** - Availability spanning 24+ hours
- ✗ **Very long durations** - 8+ hour missions/availabilities

### 11. Mission Schedule EXDATE/UNTIL

- ✗ **Mission schedule with EXDATE** - Should it be rejected or handled?
- ✗ **Mission schedule with UNTIL different from mission until** - Edge case behavior

### 12. RRULESet with Multiple RRULE Lines

- ✗ **Availability with multiple RRULE patterns** - e.g., Monday 9am-12pm AND Wednesday 2pm-5pm in one availability
- ✗ **Mission schedule with multiple RRULE patterns** - If allowed

### 13. Time Zone and DST

- ✗ **Different time zones** - Mission in UTC, availability in EST
- ✗ **Daylight saving transitions** - DST start/end
- ✗ **Time zone offsets** - +05:30, -08:00, etc.

### 14. Complex Multi-Availability Gaps

- ✗ **Mission spanning 3+ consecutive availabilities with small gaps** - More complex gap scenarios
- ✗ **Overlapping availabilities with different frequencies** - e.g., daily + weekly
- ✗ **Partial overlap scenarios** - Mission partially in one availability, partially in another

### 15. Edge Date Scenarios

- ✗ **Mission starting exactly at availability start date** - Date-level boundary
- ✗ **Mission ending exactly at availability end date** - Date-level boundary
- ✗ **Availability starting after mission starts but before mission ends** - Partial date overlap
- ✗ **Availability ending before mission ends but after mission starts** - Partial date overlap

### 16. Performance/Stress Tests

- ✗ **Many schedules (50+) against many availabilities (50+)** - Large-scale performance
- ✗ **Very long date ranges** - Mission spanning 1+ year
- ✗ **Many occurrences** - Daily mission for 6 months

### 17. Invalid/Malformed RRULE Handling

- ✓ **Invalid RRULE in mission schedule** - Throws error (covered)
- ✓ **Invalid RRULE in availability** - Skipped gracefully (covered)
- ✗ **Missing DTSTART in RRULE string** - Edge case handling
- ✗ **Invalid BY* combinations** - Conflicting modifiers
- ✗ **Conflicting RRULE options** - Invalid option combinations
- ✗ **Malformed EXDATE formats** - Invalid EXDATE strings

### 18. Special Calendar Cases

- ✗ **Leap year dates (Feb 29)** - Leap year handling
- ✗ **Month-end boundaries** - Mission on 31st when month has 30 days
- ✗ **Week boundaries** - Mission crossing week boundaries

### 19. Real-World Scenarios

- ✗ **Teacher availability** - Monday-Friday 8am-4pm, mission Monday 9am-3pm
- ✗ **Shift work** - 12-hour shifts, overnight coverage
- ✗ **Part-time patterns** - Monday/Wednesday/Friday only
- ✗ **Holiday exceptions** - Availability with many EXDATEs for holidays

### 20. Validation Error Details

- ✓ **should provide detailed violation information** - Violation details included
- ✗ **Violation messages for specific failure types** - Different message types
- ✗ **Multiple violations for same schedule** - All occurrences reported
- ✗ **Violation ordering** - Chronological or by schedule index

### 21. Constraint Edge Cases

- ✓ **should constrain mission schedule RRULE by mission date range** - Basic constraint (covered)
- ✗ **Mission schedule RRULE with UNTIL before mission start** - Edge case
- ✗ **Mission schedule RRULE with DTSTART after mission end** - Edge case
- ✗ **Constrained RRULE producing zero occurrences** - Edge case

## Running Tests

To run the test suite:

```bash
npx tsx scripts/missions-availability/tests/test-runner.ts
```

### Test Organization

Tests are organized into multiple files by topic in the `tests/` directory:

- **`test-utils.ts`** - Shared test utilities, assertions, and helper functions
- **`basic-validation.test.ts`** - Basic validation cases (7 tests)
- **`multiple-schedules.test.ts`** - Multiple schedules and availabilities (2 tests)
- **`overlapping-availabilities.test.ts`** - Overlapping availabilities (1 test)
- **`complex-multi-availability.test.ts`** - Complex real-world scenarios with multiple schedules and multiple availabilities (10 tests)
- **`availability-exceptions.test.ts`** - Availability UNTIL/EXDATE scenarios (9 tests)
- **`date-range-constraints.test.ts`** - Date range constraints (2 tests)
- **`edge-cases.test.ts`** - Edge cases and error handling (5 tests)
- **`rrule-frequencies.test.ts`** - Different RRULE frequencies (2 tests)
- **`time-boundaries.test.ts`** - Time boundary cases (3 tests)
- **`violation-details.test.ts`** - Violation details (1 test)
- **`constraint-behavior.test.ts`** - RRULE constraint behavior (1 test)
- **`test-runner.ts`** - Main test runner that executes all tests

**Total: 43 tests currently implemented**

You can also run individual test files if needed:

```bash
npx tsx scripts/missions-availability/tests/basic-validation.test.ts
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
- **Multi-Availability Coverage:** A mission schedule can be covered by multiple availabilities. For example, a mission from 7am-10am can be covered by availabilities 7am-8am and 8am-10am. The validation checks if the union of overlapping availability occurrences fully covers the mission occurrence without gaps.
- The validation ensures **no overlapping** - all mission occurrences must be fully covered by availability occurrences (either a single availability or a combination of multiple availabilities)
- The function uses the `rrule` library for RRULE parsing and occurrence generation
- Invalid availability RRULEs are skipped (logged but don't stop validation)
- Invalid mission schedule RRULEs throw errors (critical failures)
- The validation checks that the entire mission time range is covered by availability time ranges (can span multiple availabilities)
