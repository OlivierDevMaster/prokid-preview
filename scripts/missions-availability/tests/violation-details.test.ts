import {
  type MissionSchedule,
  ProfessionalAvailability,
  validateMissionAvailability,
} from '../validateMissionAvailability.ts';
import {
  assert,
  assertContains,
  assertEqual,
  assertGreaterThan,
  createWeeklyRRULE,
  missionEnd,
  missionStart,
  test,
} from './test-utils.ts';

test('should provide detailed violation information', () => {
  const availability: ProfessionalAvailability = {
    duration_mn: 60, // 10am-11am
    rrule: createWeeklyRRULE(new Date('2024-01-01T10:00:00Z'), null, 'MO'),
  };

  const missionSchedule: MissionSchedule = {
    duration_mn: 120, // 9am-11am (starts before availability)
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

  const violation = result.violations[0];
  assertEqual(violation.mission_schedule_index, 0);
  assert(
    violation.mission_occurrence_start !== undefined,
    'Should have start time'
  );
  assert(
    violation.mission_occurrence_end !== undefined,
    'Should have end time'
  );
  assertContains(
    violation.reason,
    'not covered by any professional availability'
  );
});
