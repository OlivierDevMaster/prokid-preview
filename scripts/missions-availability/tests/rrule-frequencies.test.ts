import { RRule } from 'rrule';

import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from '../validateMissionAvailability.ts';
import {
  assert,
  createDailyRRULE,
  missionEnd,
  missionStart,
  test,
} from './test-utils.ts';

test('should validate daily mission against daily availability', () => {
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createDailyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      new Date('2024-01-31T09:00:00Z')
    ),
  };

  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createDailyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-20T10:00:00Z')
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

test('should validate mission with multiple days per week', () => {
  // Availability: Monday, Wednesday, Friday 9am-12pm
  const rrule = new RRule({
    byweekday: [RRule.MO, RRule.WE, RRule.FR],
    dtstart: new Date('2024-01-01T09:00:00Z'),
    freq: RRule.WEEKLY,
  });

  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: rrule.toString(),
  };

  // Mission: Monday, Wednesday 10am-11am
  const missionRrule = new RRule({
    byweekday: [RRule.MO, RRule.WE],
    dtstart: new Date('2024-01-08T10:00:00Z'),
    freq: RRule.WEEKLY,
    until: new Date('2024-01-31T10:00:00Z'),
  });

  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: missionRrule.toString(),
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
