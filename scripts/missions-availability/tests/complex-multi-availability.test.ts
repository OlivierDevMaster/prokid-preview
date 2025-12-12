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

test('should validate mission schedule covered by multiple consecutive availabilities', () => {
  // Mission schedule: Every Monday 7am-10am (3 hours)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180, // 3 hours
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T07:00:00Z'),
      new Date('2024-01-29T07:00:00Z'),
      'MO'
    ),
  };

  // Professional has two consecutive availabilities that together cover the mission
  // Availability 1: Every Monday 7am-8am
  const availability1: ProfessionalAvailability = {
    duration_mn: 60, // 1 hour
    rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
  };

  // Availability 2: Every Monday 8am-10am
  const availability2: ProfessionalAvailability = {
    duration_mn: 120, // 2 hours
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

test('should validate mission schedule covered by multiple overlapping availabilities', () => {
  // Mission schedule: Every Monday 8am-9am (1 hour)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-29T08:00:00Z'),
      'MO'
    ),
  };

  // Professional has overlapping availabilities
  // Availability 1: Every Monday 7am-9am
  const availability1: ProfessionalAvailability = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
  };

  // Availability 2: Every Monday 8am-10am (overlaps with availability1)
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

test('should reject mission schedule partially covered by multiple availabilities', () => {
  // Mission schedule: Every Monday 7am-10am (3 hours)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T07:00:00Z'),
      new Date('2024-01-29T07:00:00Z'),
      'MO'
    ),
  };

  // Professional has two availabilities that don't fully cover the mission
  // Availability 1: Every Monday 7am-8am
  const availability1: ProfessionalAvailability = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
  };

  // Availability 2: Every Monday 8am-9am (missing 9am-10am)
  const availability2: ProfessionalAvailability = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(new Date('2024-01-01T08:00:00Z'), null, 'MO'),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability1, availability2]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(result.violations.length, 0, 'Should have violations');
});

test('should validate multiple mission schedules with complex availability patterns', () => {
  // Schedule 1: Every Monday 7am-9am
  const schedule1: MissionSchedule = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T07:00:00Z'),
      new Date('2024-01-29T07:00:00Z'),
      'MO'
    ),
  };

  // Schedule 2: Every Wednesday 14pm-16pm
  const schedule2: MissionSchedule = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(
      new Date('2024-01-10T14:00:00Z'),
      new Date('2024-01-31T14:00:00Z'),
      'WE'
    ),
  };

  // Schedule 3: Every Friday 9am-11am
  const schedule3: MissionSchedule = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(
      new Date('2024-01-12T09:00:00Z'),
      new Date('2024-01-26T09:00:00Z'),
      'FR'
    ),
  };

  // Multiple availabilities covering different time slots
  // Monday availabilities
  const mondayAvail1: ProfessionalAvailability = {
    duration_mn: 60, // 7am-8am
    rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
  };
  const mondayAvail2: ProfessionalAvailability = {
    duration_mn: 60, // 8am-9am
    rrule: createWeeklyRRULE(new Date('2024-01-01T08:00:00Z'), null, 'MO'),
  };

  // Wednesday availability
  const wednesdayAvail: ProfessionalAvailability = {
    duration_mn: 180, // 14pm-17pm
    rrule: createWeeklyRRULE(new Date('2024-01-03T14:00:00Z'), null, 'WE'),
  };

  // Friday availability
  const fridayAvail: ProfessionalAvailability = {
    duration_mn: 120, // 9am-11am
    rrule: createWeeklyRRULE(new Date('2024-01-05T09:00:00Z'), null, 'FR'),
  };

  const result = validateMissionAvailability(
    [schedule1, schedule2, schedule3],
    missionStart,
    missionEnd,
    [mondayAvail1, mondayAvail2, wednesdayAvail, fridayAvail]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should validate mission schedule with gap between availabilities', () => {
  // Mission schedule: Every Monday 7am-8am (1 hour, fits in first availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T07:00:00Z'),
      new Date('2024-01-29T07:00:00Z'),
      'MO'
    ),
  };

  // Professional has availabilities with a gap
  // Availability 1: Every Monday 7am-8am
  const availability1: ProfessionalAvailability = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
  };

  // Availability 2: Every Monday 10am-12pm (gap between 8am-10am)
  const availability2: ProfessionalAvailability = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(new Date('2024-01-01T10:00:00Z'), null, 'MO'),
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

test('should reject mission schedule spanning gap between availabilities', () => {
  // Mission schedule: Every Monday 7am-10am (spans the gap)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T07:00:00Z'),
      new Date('2024-01-29T07:00:00Z'),
      'MO'
    ),
  };

  // Professional has availabilities with a gap
  // Availability 1: Every Monday 7am-8am
  const availability1: ProfessionalAvailability = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
  };

  // Availability 2: Every Monday 10am-12pm (gap between 8am-10am)
  const availability2: ProfessionalAvailability = {
    duration_mn: 120,
    rrule: createWeeklyRRULE(new Date('2024-01-01T10:00:00Z'), null, 'MO'),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability1, availability2]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(result.violations.length, 0, 'Should have violations');
});

test('should validate complex scenario with many schedules and many availabilities', () => {
  // Multiple mission schedules across different days and times
  const schedules: MissionSchedule[] = [
    // Monday morning
    {
      duration_mn: 60, // 7am-8am
      rrule: createWeeklyRRULE(
        new Date('2024-01-08T07:00:00Z'),
        new Date('2024-01-29T07:00:00Z'),
        'MO'
      ),
    },
    // Monday afternoon
    {
      duration_mn: 120, // 14pm-16pm
      rrule: createWeeklyRRULE(
        new Date('2024-01-08T14:00:00Z'),
        new Date('2024-01-29T14:00:00Z'),
        'MO'
      ),
    },
    // Wednesday morning
    {
      duration_mn: 90, // 9am-10:30am
      rrule: createWeeklyRRULE(
        new Date('2024-01-10T09:00:00Z'),
        new Date('2024-01-31T09:00:00Z'),
        'WE'
      ),
    },
    // Friday evening
    {
      duration_mn: 180, // 18pm-21pm
      rrule: createWeeklyRRULE(
        new Date('2024-01-12T18:00:00Z'),
        new Date('2024-01-26T18:00:00Z'),
        'FR'
      ),
    },
  ];

  // Many availabilities covering different time slots
  const availabilities: ProfessionalAvailability[] = [
    // Monday morning slots
    {
      duration_mn: 60, // 7am-8am
      rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
    },
    {
      duration_mn: 60, // 8am-9am
      rrule: createWeeklyRRULE(new Date('2024-01-01T08:00:00Z'), null, 'MO'),
    },
    {
      duration_mn: 60, // 9am-10am
      rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
    },
    // Monday afternoon
    {
      duration_mn: 180, // 14pm-17pm
      rrule: createWeeklyRRULE(new Date('2024-01-01T14:00:00Z'), null, 'MO'),
    },
    // Wednesday morning
    {
      duration_mn: 120, // 9am-11am
      rrule: createWeeklyRRULE(new Date('2024-01-03T09:00:00Z'), null, 'WE'),
    },
    // Friday evening
    {
      duration_mn: 240, // 18pm-22pm
      rrule: createWeeklyRRULE(new Date('2024-01-05T18:00:00Z'), null, 'FR'),
    },
  ];

  const result = validateMissionAvailability(
    schedules,
    missionStart,
    missionEnd,
    availabilities
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should reject when one schedule in complex scenario is not covered', () => {
  // Multiple mission schedules
  const schedules: MissionSchedule[] = [
    // Monday morning - covered
    {
      duration_mn: 60, // 7am-8am
      rrule: createWeeklyRRULE(
        new Date('2024-01-08T07:00:00Z'),
        new Date('2024-01-29T07:00:00Z'),
        'MO'
      ),
    },
    // Tuesday morning - NOT covered (no Tuesday availability)
    {
      duration_mn: 60, // 9am-10am
      rrule: createWeeklyRRULE(
        new Date('2024-01-09T09:00:00Z'),
        new Date('2024-01-30T09:00:00Z'),
        'TU'
      ),
    },
  ];

  // Only Monday availabilities
  const availabilities: ProfessionalAvailability[] = [
    {
      duration_mn: 60, // 7am-8am
      rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
    },
    {
      duration_mn: 60, // 8am-9am
      rrule: createWeeklyRRULE(new Date('2024-01-01T08:00:00Z'), null, 'MO'),
    },
  ];

  const result = validateMissionAvailability(
    schedules,
    missionStart,
    missionEnd,
    availabilities
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(result.violations.length, 0, 'Should have violations');
  // Violation should be for schedule index 1 (Tuesday)
  assert(
    result.violations.some(v => v.mission_schedule_index === 1),
    'Violation should be for Tuesday schedule'
  );
});

test('should validate mission schedule covered by three consecutive availabilities', () => {
  // Mission schedule: Every Monday 7am-10am (3 hours)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T07:00:00Z'),
      new Date('2024-01-29T07:00:00Z'),
      'MO'
    ),
  };

  // Professional has three consecutive availabilities
  const availability1: ProfessionalAvailability = {
    duration_mn: 60, // 7am-8am
    rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
  };

  const availability2: ProfessionalAvailability = {
    duration_mn: 60, // 8am-9am
    rrule: createWeeklyRRULE(new Date('2024-01-01T08:00:00Z'), null, 'MO'),
  };

  const availability3: ProfessionalAvailability = {
    duration_mn: 60, // 9am-10am
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability1, availability2, availability3]
  );

  assert(result.isValid === true, 'Mission should be valid');
  assert(result.violations.length === 0, 'Should have no violations');
});

test('should reject mission schedule with partial coverage across availabilities', () => {
  // Mission schedule: Every Monday 7am-10am (3 hours)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T07:00:00Z'),
      new Date('2024-01-29T07:00:00Z'),
      'MO'
    ),
  };

  // Professional has availabilities that don't fully cover
  // Availability 1: Every Monday 7am-8am
  const availability1: ProfessionalAvailability = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(new Date('2024-01-01T07:00:00Z'), null, 'MO'),
  };

  // Availability 2: Every Monday 8:30am-9:30am (gap from 8am-8:30am, ends at 9:30am, missing 9:30am-10am)
  const availability2: ProfessionalAvailability = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(new Date('2024-01-01T08:30:00Z'), null, 'MO'),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability1, availability2]
  );

  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(result.violations.length, 0, 'Should have violations');
});
