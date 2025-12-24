import { RRule, RRuleSet, rrulestr } from 'rrule';

import {
  type MissionSchedule,
  type ProfessionalAvailability,
  updateAvailabilitiesForMissions,
} from '../updateAvailabilitiesForMissions';
import {
  assert,
  assertEqual,
  createWeeklyRRULE,
  missionEnd,
  missionStart,
  test,
} from './test-utils';

test('should handle overlapping schedules with different patterns - Mon-Fri vs Wed only', () => {
  // Availability: 9am-12pm (Monday to Friday)
  const availability: ProfessionalAvailability = {
    duration_mn: 180, // 3 hours
    rrule: new RRule({
      byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
      dtstart: new Date('2024-01-01T09:00:00Z'),
      freq: RRule.WEEKLY,
    }).toString(),
  };

  // Schedule 1: 10am-11am (Mon-Fri)
  const schedule1: MissionSchedule = {
    duration_mn: 60, // 1 hour
    rrule: new RRule({
      byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
      dtstart: new Date('2024-01-08T10:00:00Z'),
      freq: RRule.WEEKLY,
      until: new Date('2024-01-29T10:00:00Z'),
    }).toString(),
  };

  // Schedule 2: 10:30am-11:30am (Wed only) - overlaps with Schedule 1 on Wednesdays
  const schedule2: MissionSchedule = {
    duration_mn: 60, // 1 hour
    rrule: createWeeklyRRULE(
      new Date('2024-01-10T10:30:00Z'),
      new Date('2024-01-31T10:30:00Z'),
      'WE'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability],
    [schedule1, schedule2],
    missionStart,
    missionEnd
  );

  // Should update the original availability
  assertEqual(
    result.toUpdate.length,
    1,
    'Should update the original availability'
  );

  // The original should stop before the earliest schedule dtstart (Jan 8 10am)
  const updatedRule = rrulestr(result.toUpdate[0].newRrule);
  const expectedUntil = new Date('2024-01-08T10:00:00Z');
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);
  assert(
    updatedRule.options.until !== null &&
      updatedRule.options.until !== undefined &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'Original availability should stop before earliest schedule dtstart'
  );

  // Should create "before mission" parts for both schedules
  // Schedule 1: 9am-10am (Mon-Fri) during schedule period
  // Schedule 2: 9am-10:30am (Wed only) during schedule period
  const beforeMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart.getUTCHours() === 9 &&
      created.duration_mn < 180
    );
  });

  // Should have at least 2 "before mission" parts (one for each schedule pattern)
  assert(
    beforeMissionParts.length >= 2,
    'Should create "before mission" parts for both schedule patterns'
  );

  // Should create "after mission" parts for both schedules
  // Schedule 1: 11am-12pm (Mon-Fri) during schedule period
  // Schedule 2: 11:30am-12pm (Wed only) during schedule period
  const afterMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart.getUTCHours() === 11 &&
      created.duration_mn < 180
    );
  });

  // Should have at least 2 "after mission" parts (one for each schedule pattern)
  assert(
    afterMissionParts.length >= 2,
    'Should create "after mission" parts for both schedule patterns'
  );

  // Should create one post-mission availability (consolidated, using latest schedule until)
  const scheduleUntil2 = new Date('2024-01-31T10:30:00Z');
  const latestScheduleUntil = scheduleUntil2; // Latest is Jan 31

  const postMissionAvailabilities = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart > latestScheduleUntil &&
      created.duration_mn === 180
    );
  });

  assertEqual(
    postMissionAvailabilities.length,
    1,
    'Should create exactly one post-mission availability (consolidated)'
  );

  // Verify the post-mission availability preserves the original pattern (Mon-Fri)
  const postMissionRule = rrulestr(postMissionAvailabilities[0].rrule);
  const postMissionRuleObj =
    postMissionRule instanceof RRuleSet
      ? (postMissionRule as RRuleSet).rrules()[0]
      : (postMissionRule as RRule);
  assert(
    postMissionRuleObj.options.byweekday &&
      Array.isArray(postMissionRuleObj.options.byweekday) &&
      postMissionRuleObj.options.byweekday.length === 5,
    'Post-mission availability should preserve original pattern (Mon-Fri)'
  );
});

test('should handle overlapping schedules with different patterns - daily vs specific day', () => {
  // Availability: 9am-12pm daily
  const availability: ProfessionalAvailability = {
    duration_mn: 180, // 3 hours
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Schedule 1: 10am-11am (Monday only)
  const schedule1: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  // Schedule 2: 10:30am-11:30am (Monday only, but different time)
  const schedule2: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:30:00Z'),
      new Date('2024-01-29T10:30:00Z'),
      'MO'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability],
    [schedule1, schedule2],
    missionStart,
    missionEnd
  );

  // Should update the original availability
  assertEqual(
    result.toUpdate.length,
    1,
    'Should update the original availability'
  );

  // Should create parts for both schedules
  // Schedule 1: before (9am-10am), after (11am-12pm)
  // Schedule 2: before (9am-10:30am), after (11:30am-12pm)
  const beforeParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart.getUTCHours() === 9 &&
      created.duration_mn < 180
    );
  });

  assert(
    beforeParts.length >= 2,
    'Should create "before mission" parts for both schedules'
  );

  // Should create one post-mission availability
  const postMissionAvailabilities = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart > new Date('2024-01-29T10:30:00Z') &&
      created.duration_mn === 180
    );
  });

  assertEqual(
    postMissionAvailabilities.length,
    1,
    'Should create exactly one post-mission availability'
  );
});
