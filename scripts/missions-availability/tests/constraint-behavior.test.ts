import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from '../validateMissionAvailability.ts';
import {
  assert,
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
