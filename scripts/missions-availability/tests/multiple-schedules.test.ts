import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from '../validateMissionAvailability.ts';
import {
  assert,
  assertEqual,
  createWeeklyRRULE,
  missionEnd,
  missionStart,
  test,
} from './test-utils.ts';

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
  assert(result.violations.length > 0, 'Should have violations');
  assertEqual(result.violations[0].mission_schedule_index, 1);
});
