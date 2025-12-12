import { RRule } from 'rrule';

import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from './validateMissionAvailability.ts';

/**
 * Simple test runner
 */
interface TestCase {
  fn: () => void;
  name: string;
}

const tests: TestCase[] = [];
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertContains(str: string, substring: string, message?: string) {
  if (!str.includes(substring)) {
    throw new Error(message || `Expected "${str}" to contain "${substring}"`);
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, but got ${actual}`);
  }
}

function assertGreaterThan(actual: number, expected: number, message?: string) {
  if (actual <= expected) {
    throw new Error(
      message || `Expected ${actual} to be greater than ${expected}`
    );
  }
}

function assertThrows(fn: () => void, expectedError?: string) {
  try {
    fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (expectedError && !String(error).includes(expectedError)) {
      throw new Error(
        `Expected error to contain "${expectedError}", but got: ${error}`
      );
    }
  }
}

/**
 * Helper function to create a simple daily RRULE string
 */
function createDailyRRULE(dtstart: Date, until: Date | null): string {
  const rrule = new RRule({
    dtstart,
    freq: RRule.DAILY,
    until: until || undefined,
  });
  return rrule.toString();
}

/**
 * Helper function to create a simple weekly RRULE string
 */
function createWeeklyRRULE(
  dtstart: Date,
  until: Date | null,
  byday: string
): string {
  const weekdayMap: Record<string, number> = {
    FR: RRule.FR,
    MO: RRule.MO,
    SA: RRule.SA,
    SU: RRule.SU,
    TH: RRule.TH,
    TU: RRule.TU,
    WE: RRule.WE,
  };
  const rrule = new RRule({
    byweekday: [weekdayMap[byday]],
    dtstart,
    freq: RRule.WEEKLY,
    until: until || undefined,
  });
  return rrule.toString();
}

function test(name: string, fn: () => void) {
  tests.push({ fn, name });
}

// Test cases
const missionStart = new Date('2024-01-08T00:00:00Z'); // Monday
const missionEnd = new Date('2024-01-31T23:59:59Z'); // End of January

test('should validate mission fully within single availability', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180, // 3 hours
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Mission: Every Monday 10am-11am (within availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60, // 1 hour
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should reject mission that starts before availability', () => {
  // Availability: Every Monday 10am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(new Date('2024-01-01T10:00:00Z'), null, 'MO'),
  };

  // Mission: Every Monday 9am-11am (starts before availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-29T09:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(result.violations.length, 0, 'Should have violations');
  assertContains(
    result.violations[0].reason,
    'not covered by any professional availability'
  );
});

test('should reject mission that ends after availability', () => {
  // Availability: Every Monday 9am-11am
  const availability: ProfessionalAvailability = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Mission: Every Monday 9am-12pm (ends after availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-29T09:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(result.violations.length, 0, 'Should have violations');
});

test('should validate mission at exact availability boundaries', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Mission: Every Monday 9am-12pm (exact match)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-29T09:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate mission with multiple schedules against multiple availabilities', () => {
  // Availability 1: Every Monday 9am-12pm
  const availability1: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Availability 2: Every Wednesday 14pm-17pm
  const availability2: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-03T14:00:00Z'), null, 'WE'),
  };

  // Mission Schedule 1: Every Monday 10am-11am (within availability1)
  const schedule1: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  // Mission Schedule 2: Every Wednesday 15pm-16pm (within availability2)
  const schedule2: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-10T15:00:00Z'),
      new Date('2024-01-31T15:00:00Z'),
      'WE'
    ),
  };

  const result = validateMissionAvailability(
    [schedule1, schedule2],
    missionStart,
    missionEnd,
    [availability1, availability2]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should reject mission if one schedule is not covered', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Schedule 1: Every Monday 10am-11am (covered)
  const schedule1: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  // Schedule 2: Every Tuesday 10am-11am (not covered)
  const schedule2: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-09T10:00:00Z'),
      new Date('2024-01-30T10:00:00Z'),
      'TU'
    ),
  };

  const result = validateMissionAvailability(
    [schedule1, schedule2],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(result.violations.length, 0, 'Should have violations');
  assertEqual(result.violations[0].mission_schedule_index, 1);
});

test('should validate mission covered by overlapping availabilities', () => {
  // Availability 1: Every Monday 9am-12pm
  const availability1: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Availability 2: Every Monday 10am-13pm (overlaps with availability1)
  const availability2: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T10:00:00Z'), null, 'MO'),
  };

  // Mission: Every Monday 11am-12pm (covered by both)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T11:00:00Z'),
      new Date('2024-01-29T11:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability1, availability2]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate mission within availability date range', () => {
  // Availability: Every Monday 9am-12pm, valid until end of January
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, within mission date range
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should reject mission outside availability date range', () => {
  // Availability: Every Monday 9am-12pm, valid until Jan 15
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-15T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, extends to Jan 29
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violations for occurrences after Jan 15'
  );
});

test('should reject mission when no availabilities provided', () => {
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    []
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(result.violations.length, 0, 'Should have violations');
});

test('should handle empty mission schedules array', () => {
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  const result = validateMissionAvailability([], missionStart, missionEnd, [
    availability,
  ]);

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should throw error for invalid mission date range', () => {
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  assertThrows(() => {
    validateMissionAvailability(
      [missionSchedule],
      missionEnd, // end before start
      missionStart,
      [availability]
    );
  }, 'Mission end date must be after start date');
});

test('should throw error for invalid RRULE in mission schedule', () => {
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: 'INVALID_RRULE_STRING',
  };

  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  assertThrows(() => {
    validateMissionAvailability([missionSchedule], missionStart, missionEnd, [
      availability,
    ]);
  }, 'Invalid RRULE in mission schedule');
});

test('should skip invalid availability RRULEs and continue validation', () => {
  const validAvailability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  const invalidAvailability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: 'INVALID_RRULE_STRING',
  };

  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  // Should still validate against valid availability
  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [validAvailability, invalidAvailability]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate daily mission against daily availability', () => {
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createDailyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z')
    ),
  };

  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createDailyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-20T10:00:00Z')
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate mission with multiple days per week', () => {
  // Availability: Monday, Wednesday, Friday 9am-12pm
  const rrule = new RRule({
    byweekday: [RRule.MO, RRule.WE, RRule.FR],
    dtstart: new Date('2024-01-01T09:00:00Z'),
    freq: RRule.WEEKLY,
  });

  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: rrule.toString(),
  };

  // Mission: Monday, Wednesday 10am-11am
  const missionRrule = new RRule({
    byweekday: [RRule.MO, RRule.WE],
    dtstart: new Date('2024-01-08T10:00:00Z'),
    freq: RRule.WEEKLY,
    until: new Date('2024-01-31T10:00:00Z'),
  });

  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: missionRrule.toString(),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate mission that starts exactly at availability start', () => {
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'), // Exact start
      new Date('2024-01-29T09:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate mission that ends exactly at availability end', () => {
  const availability: ProfessionalAvailability = {
    duration_mn: 180, // Ends at 12pm
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  const missionSchedule: MissionSchedule = {
    duration_mn: 180, // Also ends at 12pm
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-29T09:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should reject mission that extends 1 minute past availability', () => {
  const availability: ProfessionalAvailability = {
    duration_mn: 180, // 9am-12pm
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  const missionSchedule: MissionSchedule = {
    duration_mn: 181, // 9am-12:01pm (1 minute too long)
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-29T09:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(result.violations.length, 0, 'Should have violations');
});

test('should provide detailed violation information', () => {
  const availability: ProfessionalAvailability = {
    duration_mn: 60, // 10am-11am
    rrule: createWeeklyRRULE(new Date('2024-01-01T10:00:00Z'), null, 'MO'),
  };

  const missionSchedule: MissionSchedule = {
    duration_mn: 120, // 9am-11am (starts before availability)
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-29T09:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(result.violations.length, 0, 'Should have violations');

  const violation = result.violations[0];
  assertEqual(violation.mission_schedule_index, 0);
  assert(
    violation.mission_occurrence_start !== undefined,
    'Should have start time'
  );
  assert(
    violation.mission_occurrence_end !== undefined,
    'Should have end time'
  );
  assertContains(
    violation.reason,
    'not covered by any professional availability'
  );
});

// Run all tests
console.log('Running validateMissionAvailability tests...\n');

for (const testCase of tests) {
  try {
    testCase.fn();
    console.log(`✓ ${testCase.name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${testCase.name}`);
    console.error(
      `  ${error instanceof Error ? error.message : String(error)}\n`
    );
    failed++;
  }
}

console.log(
  `\nResults: ${passed} passed, ${failed} failed, ${tests.length} total`
);

if (failed > 0) {
  process.exit(1);
}
