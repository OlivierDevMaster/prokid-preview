import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from '../validateMissionAvailability.ts';
import {
  assert,
  assertContains,
  assertGreaterThan,
  createWeeklyRRULE,
  missionEnd,
  missionStart,
  test,
} from './test-utils.ts';

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
