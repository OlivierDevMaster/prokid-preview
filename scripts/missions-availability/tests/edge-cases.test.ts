import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from '../validateMissionAvailability.ts';
import {
  assert,
  assertGreaterThan,
  assertThrows,
  createWeeklyRRULE,
  missionEnd,
  missionStart,
  test,
} from './test-utils.ts';

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
