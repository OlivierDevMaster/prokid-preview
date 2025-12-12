import { RRule } from 'rrule';

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

test('should constrain mission schedule RRULE by mission date range', () => {
  // Availability: Every Monday 9am-12pm, valid for full year
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-12-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am
  // RRULE extends beyond mission date range (should be constrained)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-12-31T10:00:00Z'), // Extends beyond mission end (Jan 31)
      'MO'
    ),
  };

  // Mission date range: Jan 8 - Jan 31
  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid because the RRULE is constrained to mission date range
  // Only occurrences between Jan 8 and Jan 31 are generated
  assert(result.isValid === true, 'Mission should be valid after constraint');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate mission when schedule UNTIL is before mission end', () => {
  // Availability: Every Monday 9am-12pm, valid for full period
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am
  // Schedule UNTIL is before mission end (schedule ends early, which is OK)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-22T10:00:00Z'), // Stops at Jan 22, before mission end (Jan 31)
      'MO'
    ),
  };

  // Mission date range: Jan 8 - Jan 31
  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid - schedule ending early is normal and acceptable
  // Only occurrences up to Jan 22 are generated and validated
  assert(
    result.isValid === true,
    'Mission should be valid when schedule ends early'
  );
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should constrain mission schedule when UNTIL is after mission end', () => {
  // Availability: Every Monday 9am-12pm, valid for full period
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am
  // Schedule UNTIL is after mission end (should be constrained to mission end)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-02-15T10:00:00Z'), // Extends beyond mission end (Jan 31)
      'MO'
    ),
  };

  // Mission date range: Jan 8 - Jan 31
  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid because the RRULE is automatically constrained to mission date range
  // The schedule's UNTIL is set to mission end, so only occurrences up to Jan 31 are generated
  assert(
    result.isValid === true,
    'Mission should be valid after constraining UNTIL'
  );
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate mission with multiple schedules where one ends early', () => {
  // Availability: Every Monday and Wednesday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Schedule 1: Every Monday 10am-11am, ends at mission end
  const schedule1: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-31T10:00:00Z'), // Ends at mission end
      'MO'
    ),
  };

  // Schedule 2: Every Monday 11am-12pm, ends early (Jan 22)
  const schedule2: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T11:00:00Z'),
      new Date('2024-01-22T11:00:00Z'), // Ends early, before mission end
      'MO'
    ),
  };

  // Mission date range: Jan 8 - Jan 31
  const result = validateMissionAvailability(
    [schedule1, schedule2],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid - schedule2 ending early is normal
  // schedule1 continues to mission end, schedule2 stops early
  assert(
    result.isValid === true,
    'Mission should be valid when one schedule ends early'
  );
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should preserve UNTIL when schedule ends exactly at mission end', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, UNTIL exactly matches mission end
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-31T10:00:00Z'), // UNTIL equals mission end
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid - UNTIL at mission end is preserved
  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should constrain UNTIL when schedule has no UNTIL (undefined)', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, no UNTIL (should be constrained to mission end)
  // We create a weekly RRULE without UNTIL by not setting it
  const missionRRULE = new RRule({
    byweekday: [RRule.MO],
    dtstart: new Date('2024-01-08T10:00:00Z'),
    freq: RRule.WEEKLY,
    // No UNTIL - should be constrained to mission end
  });

  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: missionRRULE.toString(),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid - UNTIL is set to mission end when not provided
  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should preserve DTSTART when schedule starts after mission start', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, starts Jan 15 (after mission start Jan 8)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-15T10:00:00Z'), // Starts after mission start
      new Date('2024-01-31T10:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid - DTSTART after mission start is preserved
  // Only occurrences from Jan 15 onwards are generated
  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should constrain DTSTART when schedule starts before mission start', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, starts Jan 1 (before mission start Jan 8)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T10:00:00Z'), // Starts before mission start
      new Date('2024-01-31T10:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid - DTSTART is constrained to mission start (Jan 8)
  // Only occurrences from Jan 8 onwards are generated
  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should preserve DTSTART when schedule starts exactly at mission start', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, starts exactly at mission start
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'), // Starts exactly at mission start
      new Date('2024-01-31T10:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid - DTSTART at mission start is preserved
  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should set DTSTART to mission start when DTSTART is missing from RRULE string', () => {
  // Availability: Every Monday 00:00-12:00 (covers midnight to noon)
  // When DTSTART is missing, it's set to missionDtstart (00:00:00), so availability must cover that time
  const availability: ProfessionalAvailability = {
    duration_mn: 720, // 12 hours: 00:00 to 12:00
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-31T00:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 1 hour, no DTSTART in RRULE string
  // Create RRULE without DTSTART line (only RRULE line)
  const missionRRULE = new RRule({
    byweekday: [RRule.MO],
    freq: RRule.WEEKLY,
    // No dtstart - rrule library will default to current date, but we should override to mission start
  });

  // Remove DTSTART from the string to simulate missing DTSTART
  const rruleString = missionRRULE.toString();
  const rruleWithoutDtstart = rruleString
    .split('\n')
    .filter(line => !line.trim().startsWith('DTSTART:'))
    .join('\n');

  const missionSchedule: MissionSchedule = {
    duration_mn: 60, // 1 hour
    rrule: rruleWithoutDtstart, // RRULE string without DTSTART
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8 00:00:00
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid - DTSTART is set to mission start (00:00:00) when missing
  // Mission occurrences will be at 00:00:00, which is covered by availability 00:00-12:00
  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate mission schedule with EXDATE that still has occurrences', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, but excludes Jan 15 (one Monday)
  // Should still have occurrences on Jan 8, 22, 29
  const missionRRULE = `DTSTART:20240108T100000Z
RRULE:FREQ=WEEKLY;BYWEEKDAY=MO;UNTIL=20240131T100000Z
EXDATE:20240115T100000Z`;

  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: missionRRULE,
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid - EXDATE excludes one occurrence but others remain
  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should reject mission schedule with EXDATE that excludes all occurrences', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, but excludes all Mondays in the period
  // Jan 8, 15, 22, 29 are all Mondays - excluding all of them leaves no occurrences
  const missionRRULE = `DTSTART:20240108T100000Z
RRULE:FREQ=WEEKLY;BYWEEKDAY=MO;UNTIL=20240131T100000Z
EXDATE:20240108T100000Z,20240115T100000Z,20240122T100000Z,20240129T100000Z`;

  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: missionRRULE,
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be invalid - EXDATE excludes all occurrences, schedule is empty
  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violation for empty schedule'
  );
  assert(
    result.violations[0].reason.includes('no occurrences'),
    'Violation should mention no occurrences'
  );
});

test('should validate mission schedule with EXDATE outside mission period', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, but excludes Jan 1 (before mission starts)
  // EXDATE is outside mission period, so it doesn't affect mission occurrences
  const missionRRULE = `DTSTART:20240108T100000Z
RRULE:FREQ=WEEKLY;BYWEEKDAY=MO;UNTIL=20240131T100000Z
EXDATE:20240101T100000Z`;

  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: missionRRULE,
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be valid - EXDATE is outside mission period, all mission occurrences remain
  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should reject mission schedule when DTSTART is after mission end', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, but DTSTART is after mission end
  // Mission runs Jan 8 - Jan 31, but schedule starts Feb 5 (after mission ends)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-02-05T10:00:00Z'), // Starts after mission end (Jan 31)
      new Date('2024-02-26T10:00:00Z'),
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be invalid - DTSTART is preserved (after mission start) but it's after mission end
  // This results in no occurrences within the mission period
  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violation for schedule with no occurrences'
  );
  assert(
    result.violations[0].reason.includes('no occurrences'),
    'Violation should mention no occurrences'
  );
});

test('should reject mission schedule when UNTIL is before mission start', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am, but UNTIL is before mission start
  // Mission runs Jan 8 - Jan 31, but schedule ends Jan 1 (before mission starts)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2023-12-25T10:00:00Z'), // Starts before mission
      new Date('2024-01-01T10:00:00Z'), // Ends before mission start (Jan 8)
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be invalid - UNTIL is preserved (before mission until) but it's before mission start
  // DTSTART is constrained to mission start, but UNTIL is before that, so no occurrences
  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violation for schedule with no occurrences'
  );
  assert(
    result.violations[0].reason.includes('no occurrences'),
    'Violation should mention no occurrences'
  );
});

test('should reject mission schedule when DTSTART after mission end and UNTIL before mission start', () => {
  // Availability: Every Monday 9am-12pm
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z'),
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am
  // Schedule completely outside mission period: starts after mission ends, ends before mission starts
  // This is an edge case but should be handled
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-02-05T10:00:00Z'), // After mission end (Jan 31)
      new Date('2024-01-01T10:00:00Z'), // Before mission start (Jan 8) - invalid but should be handled
      'MO'
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart, // Jan 8
    missionEnd, // Jan 31
    [availability]
  );

  // Should be invalid - schedule is completely outside mission period
  // DTSTART is preserved (after mission start) but after mission end
  // UNTIL is preserved (before mission until) but before mission start
  // This results in no occurrences
  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violation for schedule with no occurrences'
  );
});
