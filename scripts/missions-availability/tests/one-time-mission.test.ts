import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from '../validateMissionAvailability.ts';
import { assert, assertEqual, test } from './test-utils.ts';

test('should validate one-time mission with COUNT=1', () => {
  // One-time mission: June 1st, 2025, 9am-11am (120 minutes)
  const missionSchedule: MissionSchedule = {
    duration_mn: 120,
    rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY;COUNT=1',
  };

  // Availability: Daily 8am-12pm (240 minutes) - covers the one-time mission
  const availability: ProfessionalAvailability = {
    duration_mn: 240,
    rrule: 'DTSTART:20250601T080000Z\nRRULE:FREQ=DAILY;UNTIL=20251231T180000Z',
  };

  const missionStart = new Date('2025-06-01T09:00:00Z');
  const missionUntil = new Date('2025-06-01T11:00:00Z');

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionUntil,
    [availability]
  );

  assert(result.isValid === true, 'One-time mission should be valid');
  assertEqual(result.violations.length, 0, 'Should have no violations');
});

test('should reject one-time mission outside availability', () => {
  // One-time mission: June 1st, 2025, 9am-11am (120 minutes)
  const missionSchedule: MissionSchedule = {
    duration_mn: 120,
    rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY;COUNT=1',
  };

  // Availability: Monday only, 9am-12pm - doesn't cover June 1st (which is a Sunday)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule:
      'DTSTART:20250602T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20251231T180000Z',
  };

  const missionStart = new Date('2025-06-01T09:00:00Z');
  const missionUntil = new Date('2025-06-01T11:00:00Z');

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionUntil,
    [availability]
  );

  assert(result.isValid === false, 'One-time mission should be invalid');
  assert(result.violations.length > 0, 'Should have violations');
});

test('should validate one-time mission with exact date match', () => {
  // One-time mission: June 1st, 2025, 9am-11am (120 minutes)
  const missionSchedule: MissionSchedule = {
    duration_mn: 120,
    rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY;COUNT=1',
  };

  // Availability: Same day, 8am-1pm (300 minutes) - fully covers the mission
  const availability: ProfessionalAvailability = {
    duration_mn: 300,
    rrule: 'DTSTART:20250601T080000Z\nRRULE:FREQ=DAILY;UNTIL=20250601T130000Z',
  };

  const missionStart = new Date('2025-06-01T09:00:00Z');
  const missionUntil = new Date('2025-06-01T11:00:00Z');

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionUntil,
    [availability]
  );

  assert(result.isValid === true, 'One-time mission should be valid');
  assertEqual(result.violations.length, 0, 'Should have no violations');
});

test('should validate one-time mission with partial time coverage', () => {
  // One-time mission: June 1st, 2025, 9am-11am (120 minutes)
  const missionSchedule: MissionSchedule = {
    duration_mn: 120,
    rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY;COUNT=1',
  };

  // Availability: 9am-10:30am (90 minutes) - doesn't fully cover 120 min mission
  const availability: ProfessionalAvailability = {
    duration_mn: 90,
    rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY;UNTIL=20251231T180000Z',
  };

  const missionStart = new Date('2025-06-01T09:00:00Z');
  const missionUntil = new Date('2025-06-01T11:00:00Z');

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionUntil,
    [availability]
  );

  assert(
    result.isValid === false,
    'One-time mission should be invalid (duration too short)'
  );
  assert(result.violations.length > 0, 'Should have violations');
});

test('should validate one-time mission with multiple availabilities covering it', () => {
  // One-time mission: June 1st, 2025, 9am-11am (120 minutes)
  const missionSchedule: MissionSchedule = {
    duration_mn: 120,
    rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY;COUNT=1',
  };

  // Two availabilities that together cover the mission:
  // 1. 9am-10am (60 min)
  // 2. 10am-11am (60 min)
  const availability1: ProfessionalAvailability = {
    duration_mn: 60,
    rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY;UNTIL=20251231T180000Z',
  };

  const availability2: ProfessionalAvailability = {
    duration_mn: 60,
    rrule: 'DTSTART:20250601T100000Z\nRRULE:FREQ=DAILY;UNTIL=20251231T180000Z',
  };

  const missionStart = new Date('2025-06-01T09:00:00Z');
  const missionUntil = new Date('2025-06-01T11:00:00Z');

  const result = validateMissionAvailability(
    [missionSchedule],
    missionStart,
    missionUntil,
    [availability1, availability2]
  );

  assert(
    result.isValid === true,
    'One-time mission should be valid (covered by multiple availabilities)'
  );
  assertEqual(result.violations.length, 0, 'Should have no violations');
});
