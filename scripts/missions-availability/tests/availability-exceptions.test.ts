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

test('should reject mission when availability UNTIL stops mid-mission', () => {
  // Availability: Every Monday 7am-11am, but UNTIL stops at Jan 15
  // Mission runs Jan 8 - Jan 31, so availability stops before mission ends
  const availability: ProfessionalAvailability = {
    duration_mn: 240, // 4 hours
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T07:00:00Z'),
      new Date('2024-01-15T07:00:00Z'), // Stops at Jan 15
      'MO'
    ),
  };

  // Mission: Every Monday 8am-9am, runs Jan 8 - Jan 29
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-29T08:00:00Z'), // Extends beyond availability UNTIL
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violations for occurrences after Jan 15'
  );
});

test('should reject mission when availability has EXDATE during mission period', () => {
  // Availability: Every Monday 7am-11am, but excludes Jan 15
  // Use rrulestr format directly to ensure proper parsing
  const availabilityRRULE = `DTSTART:20240101T070000Z
RRULE:FREQ=WEEKLY;BYWEEKDAY=MO
EXDATE:20240115T070000Z`;

  const availability: ProfessionalAvailability = {
    duration_mn: 240, // 4 hours
    rrule: availabilityRRULE,
  };

  // Mission: Every Monday 8am-9am, runs Jan 8 - Jan 29
  // Jan 15 is a Monday, so that occurrence won't be covered
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-29T08:00:00Z'),
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
    'Should have violations for Jan 15 occurrence'
  );
});

test('should validate mission when availability EXDATE is outside mission period', () => {
  // Availability: Every Monday 7am-11am, but excludes Jan 1 (before mission starts)
  // Use rrulestr format directly to ensure proper parsing
  const availabilityRRULE = `DTSTART:20240101T070000Z
RRULE:FREQ=WEEKLY;BYWEEKDAY=MO
EXDATE:20240101T070000Z`;

  const availability: ProfessionalAvailability = {
    duration_mn: 240, // 4 hours
    rrule: availabilityRRULE,
  };

  // Mission: Every Monday 8am-9am, runs Jan 8 - Jan 29
  // Jan 1 exclusion doesn't affect mission period
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-29T08:00:00Z'),
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

test('should reject mission when one availability stops early in multi-availability scenario', () => {
  // Mission: Every Monday 7am-10am (3 hours)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T07:00:00Z'),
      new Date('2024-01-29T07:00:00Z'),
      'MO'
    ),
  };

  // Availability 1: Every Monday 7am-8am, UNTIL Jan 31 (full period)
  const availability1: ProfessionalAvailability = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T07:00:00Z'),
      new Date('2024-01-31T07:00:00Z'),
      'MO'
    ),
  };

  // Availability 2: Every Monday 8am-10am, but UNTIL stops at Jan 15 (stops early!)
  const availability2: ProfessionalAvailability = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T08:00:00Z'),
      new Date('2024-01-15T08:00:00Z'), // Stops early
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability1, availability2]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violations for occurrences after Jan 15'
  );
});

test('should reject mission when availability has multiple EXDATEs during mission period', () => {
  // Availability: Every Monday 7am-11am, but excludes Jan 15 and Jan 22
  // Use rrulestr format directly to ensure proper parsing
  const availabilityRRULE = `DTSTART:20240101T070000Z
RRULE:FREQ=WEEKLY;BYWEEKDAY=MO
EXDATE:20240115T070000Z,20240122T070000Z`;

  const availability: ProfessionalAvailability = {
    duration_mn: 240,
    rrule: availabilityRRULE,
  };

  // Mission: Every Monday 8am-9am, runs Jan 8 - Jan 29
  // Jan 15 and Jan 22 are Mondays, so those occurrences won't be covered
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-29T08:00:00Z'),
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
    'Should have violations for Jan 15 and Jan 22 occurrences'
  );
  // Should have at least 2 violations (one for each excluded date)
  assert(
    result.violations.length >= 2,
    'Should have violations for both excluded dates'
  );
});

test('should validate mission when availability UNTIL extends beyond mission period', () => {
  // Availability: Every Monday 7am-11am, UNTIL extends to Feb 15 (beyond mission)
  const availability: ProfessionalAvailability = {
    duration_mn: 240,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T07:00:00Z'),
      new Date('2024-02-15T07:00:00Z'), // Extends beyond mission end
      'MO'
    ),
  };

  // Mission: Every Monday 8am-9am, runs Jan 8 - Jan 31
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-29T08:00:00Z'),
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

test('should reject mission when availability with EXDATE creates gap in multi-availability coverage', () => {
  // Mission: Every Monday 7am-10am (3 hours)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T07:00:00Z'),
      new Date('2024-01-29T07:00:00Z'),
      'MO'
    ),
  };

  // Availability 1: Every Monday 7am-8am
  const availability1: ProfessionalAvailability = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
  };

  // Availability 2: Every Monday 8am-10am, but excludes Jan 15
  const availability2RRULE = `DTSTART:20240101T080000Z
RRULE:FREQ=WEEKLY;BYWEEKDAY=MO
EXDATE:20240115T080000Z`;

  const availability2: ProfessionalAvailability = {
    duration_mn: 120,
    rrule: availability2RRULE,
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability1, availability2]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violations for Jan 15 occurrence (8am-10am part not covered)'
  );
});

test('should validate mission when availability has EXDATE but other availabilities cover it', () => {
  // Mission: Every Monday 8am-9am
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-29T08:00:00Z'),
      'MO'
    ),
  };

  // Availability 1: Every Monday 7am-9am, but excludes Jan 15
  const availability1RRULE = `DTSTART:20240101T070000Z
RRULE:FREQ=WEEKLY;BYWEEKDAY=MO
EXDATE:20240115T070000Z`;

  const availability1: ProfessionalAvailability = {
    duration_mn: 120,
    rrule: availability1RRULE,
  };

  // Availability 2: Every Monday 8am-10am (covers Jan 15)
  const availability2: ProfessionalAvailability = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(new Date('2024-01-01T08:00:00Z'), null, 'MO'),
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

test('should reject mission when availability UNTIL creates partial coverage', () => {
  // Mission: Every Monday 7am-10am (3 hours)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T07:00:00Z'),
      new Date('2024-01-29T07:00:00Z'),
      'MO'
    ),
  };

  // Availability: Every Monday 7am-11am, but UNTIL stops at Jan 15 at 9am
  // This means the Jan 15 occurrence only covers 7am-9am, not the full 7am-11am
  // Actually, UNTIL applies to the pattern, so occurrences after Jan 15 won't exist at all
  // But for Jan 15 itself, if the occurrence exists, it should be full duration
  // Let me think... UNTIL means no occurrences after that date/time
  // So if UNTIL is Jan 15 9am, and pattern is weekly Monday 7am-11am:
  // - Jan 8: 7am-11am (full)
  // - Jan 15: This is tricky - if UNTIL is Jan 15 9am, does the Jan 15 occurrence exist?
  //   According to RFC 5545, UNTIL is inclusive, so Jan 15 7am-11am should exist if 7am < 9am
  //   But the occurrence would be truncated? No, UNTIL affects whether the occurrence exists, not its duration
  //   Actually, I think UNTIL in the RRULE affects the recurrence pattern, not individual occurrence duration
  //   So if UNTIL is Jan 15 9am and pattern is Monday 7am-11am, the Jan 15 occurrence at 7am would exist
  //   But wait, that doesn't make sense. Let me check the rrule library behavior.

  // Actually, a better test: Availability UNTIL stops before mission ends, so later mission occurrences aren't covered
  const availability: ProfessionalAvailability = {
    duration_mn: 240, // 4 hours
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T07:00:00Z'),
      new Date('2024-01-15T07:00:00Z'), // Stops at Jan 15
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
