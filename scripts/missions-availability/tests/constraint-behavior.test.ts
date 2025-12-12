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
