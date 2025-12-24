import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from '../validateMissionAvailability.ts';
import {
  assert,
  assertGreaterThan,
  createDailyRRULE,
  missionEnd,
  missionStart,
  test,
} from './test-utils.ts';

test('should validate overnight mission that spans midnight', () => {
  // Availability: Daily 22:00-02:00 (overnight, spans midnight)
  const availability: ProfessionalAvailability = {
    duration_mn: 240, // 4 hours: 22:00 to 02:00 next day
    rrule: createDailyRRULE(
      new Date('2024-01-08T22:00:00Z'),
      new Date('2024-01-31T22:00:00Z')
    ),
  };

  // Mission: Daily 23:00-01:00 (overnight, spans midnight, 2 hours)
  const missionSchedule: MissionSchedule = {
    duration_mn: 120, // 2 hours: 23:00 to 01:00 next day
    rrule: createDailyRRULE(
      new Date('2024-01-08T23:00:00Z'),
      new Date('2024-01-31T23:00:00Z')
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

test('should reject overnight mission that extends beyond availability', () => {
  // Availability: Daily 23:00-01:00 (2 hours overnight)
  const availability: ProfessionalAvailability = {
    duration_mn: 120, // 2 hours: 23:00 to 01:00 next day
    rrule: createDailyRRULE(
      new Date('2024-01-08T23:00:00Z'),
      new Date('2024-01-31T23:00:00Z')
    ),
  };

  // Mission: Daily 22:30-01:30 (3 hours overnight, extends beyond availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180, // 3 hours: 22:30 to 01:30 next day
    rrule: createDailyRRULE(
      new Date('2024-01-08T22:30:00Z'),
      new Date('2024-01-31T22:30:00Z')
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
    'Should have violations for mission extending beyond availability'
  );
});

test('should validate multi-day mission spanning 24+ hours', () => {
  // Availability: Daily 00:00-00:00 next day (full day, 24 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 1440, // 24 hours: 00:00 to 00:00 next day
    rrule: createDailyRRULE(
      new Date('2024-01-08T00:00:00Z'),
      new Date('2024-01-31T00:00:00Z')
    ),
  };

  // Mission: Daily 00:00-00:00 next day (24 hours, same as availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 1440, // 24 hours: 00:00 to 00:00 next day
    rrule: createDailyRRULE(
      new Date('2024-01-08T00:00:00Z'),
      new Date('2024-01-31T00:00:00Z')
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

test('should validate multi-day mission spanning 48 hours', () => {
  // Availability: Daily 00:00-23:59 (full day, 24 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 1440, // 24 hours: full day
    rrule: createDailyRRULE(
      new Date('2024-01-08T00:00:00Z'),
      new Date('2024-01-31T00:00:00Z')
    ),
  };

  // Mission: Every 2 days, 48 hours duration
  // This is a bit tricky - we'll use a daily mission with 48 hour duration
  const missionSchedule: MissionSchedule = {
    duration_mn: 2880, // 48 hours: 09:00 to 09:00 two days later
    rrule: createDailyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z')
    ),
  };

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionEnd,
    [availability]
  );

  // Should be invalid because 48-hour mission can't be covered by 24-hour availability
  // Each mission occurrence spans 2 days, but availability is only 24 hours per day
  assert(result.isValid === false, 'Mission should be invalid');
  assertGreaterThan(
    result.violations.length,
    0,
    'Should have violations for 48-hour mission not covered by 24-hour availability'
  );
});

test('should validate mission with multi-day availability spanning 24+ hours', () => {
  // Availability: Daily 00:00-23:59 (full day, 24 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 1440, // 24 hours: full day
    rrule: createDailyRRULE(
      new Date('2024-01-08T00:00:00Z'),
      new Date('2024-01-31T00:00:00Z')
    ),
  };

  // Mission: Daily 12:00-18:00 (6 hours, within the 24-hour availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 360, // 6 hours: 12:00 to 18:00
    rrule: createDailyRRULE(
      new Date('2024-01-08T12:00:00Z'),
      new Date('2024-01-31T12:00:00Z')
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

test('should validate very long duration mission (8+ hours)', () => {
  // Availability: Daily 08:00-20:00 (12 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 720, // 12 hours: 08:00 to 20:00
    rrule: createDailyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-31T08:00:00Z')
    ),
  };

  // Mission: Daily 09:00-17:00 (8 hours)
  const missionSchedule: MissionSchedule = {
    duration_mn: 480, // 8 hours: 09:00 to 17:00
    rrule: createDailyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z')
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

test('should validate very long duration availability (10+ hours)', () => {
  // Availability: Daily 08:00-18:00 (10 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 600, // 10 hours: 08:00 to 18:00
    rrule: createDailyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-31T08:00:00Z')
    ),
  };

  // Mission: Daily 10:00-16:00 (6 hours)
  const missionSchedule: MissionSchedule = {
    duration_mn: 360, // 6 hours: 10:00 to 16:00
    rrule: createDailyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-31T10:00:00Z')
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

test('should reject very long duration mission that exceeds availability', () => {
  // Availability: Daily 09:00-17:00 (8 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 480, // 8 hours: 09:00 to 17:00
    rrule: createDailyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z')
    ),
  };

  // Mission: Daily 08:00-18:00 (10 hours, exceeds availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 600, // 10 hours: 08:00 to 18:00
    rrule: createDailyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-31T08:00:00Z')
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
    'Should have violations for 10-hour mission exceeding 8-hour availability'
  );
});

test('should validate overnight mission covered by single availability spanning midnight', () => {
  // Availability: Daily 22:00-02:00 (4 hours, spans midnight)
  const availability: ProfessionalAvailability = {
    duration_mn: 240, // 4 hours: 22:00 to 02:00 next day
    rrule: createDailyRRULE(
      new Date('2024-01-08T22:00:00Z'),
      new Date('2024-01-31T22:00:00Z')
    ),
  };

  // Mission: Daily 23:00-01:00 (2 hours overnight, spans midnight)
  const missionSchedule: MissionSchedule = {
    duration_mn: 120, // 2 hours: 23:00 to 01:00 next day
    rrule: createDailyRRULE(
      new Date('2024-01-08T23:00:00Z'),
      new Date('2024-01-31T23:00:00Z')
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
