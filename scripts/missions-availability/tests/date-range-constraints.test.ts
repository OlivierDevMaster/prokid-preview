import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from '../validateMissionAvailability.ts';
import {
  assert,
  assertGreaterThan,
  createWeeklyRRULE,
  missionEnd,
  missionStart,
  test,
} from './test-utils.ts';

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

test('should validate mission starting exactly at availability start date', () => {
  // Availability: Every Monday 9am-12pm, starts Jan 8, ends Jan 31
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'), // Starts exactly when mission starts
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, starts Jan 8 (same date as availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'), // Same date, different time
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate mission ending exactly at availability end date', () => {
  // Availability: Every Monday 9am-12pm, starts Jan 1, ends Jan 31
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'), // Ends exactly when mission ends
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, ends Jan 31 (same date as availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-31T10:00:00Z'), // Same date, different time
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should reject mission when availability starts after mission starts but before mission ends', () => {
  // Mission: Every Monday 10am-11am, Jan 8 - Jan 31
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-31T10:00:00Z'),
      'MO'
    ),
  };

  // Availability: Every Monday 9am-12pm, starts Jan 15 (after mission start, before mission end)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-15T09:00:00Z'), // Starts after mission start (Jan 8)
      new Date('2024-01-31T09:00:00Z'), // Ends when mission ends
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be invalid because availability doesn't cover Jan 8 and Jan 15 occurrences
  // (Jan 8 is before availability starts, Jan 15 might be covered if time allows)
  // Actually, let me check: Jan 8 mission is at 10am, availability starts Jan 15 at 9am
  // So Jan 8 mission is not covered, but Jan 15, 22, 29 should be covered
  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violations for occurrences before availability starts (Jan 8)'
  );
});

test('should reject mission when availability ends before mission ends but after mission starts', () => {
  // Mission: Every Monday 10am-11am, Jan 8 - Jan 31
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-31T10:00:00Z'),
      'MO'
    ),
  };

  // Availability: Every Monday 9am-12pm, ends Jan 22 (before mission ends, after mission starts)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'), // Starts when mission starts
      new Date('2024-01-22T09:00:00Z'), // Ends before mission ends (Jan 31)
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be invalid because availability doesn't cover Jan 29 occurrence
  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violations for occurrences after availability ends (Jan 29)'
  );
});
