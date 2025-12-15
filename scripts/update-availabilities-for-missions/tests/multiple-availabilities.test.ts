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

test('should handle mission covering multiple consecutive availabilities', () => {
  // Three consecutive availabilities forming a continuous period: 8h-9h, 9h-10h, 10h-11h
  const availability1: ProfessionalAvailability = {
    duration_mn: 60, // 8h-9h
    rrule: createWeeklyRRULE(new Date('2024-01-01T08:00:00Z'), null, 'MO'),
  };

  const availability2: ProfessionalAvailability = {
    duration_mn: 60, // 9h-10h
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  const availability3: ProfessionalAvailability = {
    duration_mn: 60, // 10h-11h
    rrule: createWeeklyRRULE(new Date('2024-01-01T10:00:00Z'), null, 'MO'),
  };

  // Mission schedule covers all three: 8h-11h
  const missionSchedule: MissionSchedule = {
    duration_mn: 180, // 3 hours
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T08:00:00Z'),
      new Date('2024-01-29T08:00:00Z'),
      'MO'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability1, availability2, availability3],
    [missionSchedule],
    missionStart,
    missionEnd
  );

  // Should update all three availabilities
  assertEqual(
    result.toUpdate.length,
    3,
    'Should update all three availabilities'
  );

  // Each availability should stop before schedule dtstart (Jan 8 8am)
  const scheduleDtstart = new Date('2024-01-08T08:00:00Z');
  const expectedUntil = new Date(scheduleDtstart);
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);

  for (const update of result.toUpdate) {
    const updatedRule = rrulestr(update.newRrule);
    assert(
      updatedRule.options.until !== null &&
        updatedRule.options.until !== undefined &&
        Math.abs(
          updatedRule.options.until.getTime() - expectedUntil.getTime()
        ) < 60000,
      'Each availability should have UNTIL set to just before schedule dtstart (Jan 8 8am)'
    );
  }

  // Should create one post-mission availability for each original availability
  // Each should start after schedule until (Jan 29 8am)
  const scheduleUntil = new Date('2024-01-29T08:00:00Z');
  const postMissionAvailabilities = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart > scheduleUntil &&
      created.duration_mn === 60
    );
  });

  assertEqual(
    postMissionAvailabilities.length,
    3,
    'Should create one post-mission availability for each original availability'
  );

  // Verify each post-mission availability preserves its original time slot
  // Availability 1: should resume at 8h
  const postMission1 = postMissionAvailabilities.find(
    created =>
      created.duration_mn === 60 &&
      (() => {
        const rule = rrulestr(created.rrule);
        const ruleObj =
          rule instanceof RRuleSet
            ? (rule as RRuleSet).rrules()[0]
            : (rule as RRule);
        return (
          ruleObj.options.dtstart && ruleObj.options.dtstart.getUTCHours() === 8
        );
      })()
  );
  assert(
    postMission1 !== undefined,
    'Should have post-mission availability for 8h-9h slot'
  );

  // Availability 2: should resume at 9h
  const postMission2 = postMissionAvailabilities.find(
    created =>
      created.duration_mn === 60 &&
      (() => {
        const rule = rrulestr(created.rrule);
        const ruleObj =
          rule instanceof RRuleSet
            ? (rule as RRuleSet).rrules()[0]
            : (rule as RRule);
        return (
          ruleObj.options.dtstart && ruleObj.options.dtstart.getUTCHours() === 9
        );
      })()
  );
  assert(
    postMission2 !== undefined,
    'Should have post-mission availability for 9h-10h slot'
  );

  // Availability 3: should resume at 10h
  const postMission3 = postMissionAvailabilities.find(
    created =>
      created.duration_mn === 60 &&
      (() => {
        const rule = rrulestr(created.rrule);
        const ruleObj =
          rule instanceof RRuleSet
            ? (rule as RRuleSet).rrules()[0]
            : (rule as RRule);
        return (
          ruleObj.options.dtstart &&
          ruleObj.options.dtstart.getUTCHours() === 10
        );
      })()
  );
  assert(
    postMission3 !== undefined,
    'Should have post-mission availability for 10h-11h slot'
  );
});

test('should handle mission partially covering multiple availabilities', () => {
  // Three consecutive availabilities: 8h-9h, 9h-10h, 10h-11h
  const availability1: ProfessionalAvailability = {
    duration_mn: 60, // 8h-9h
    rrule: createWeeklyRRULE(new Date('2024-01-01T08:00:00Z'), null, 'MO'),
  };

  const availability2: ProfessionalAvailability = {
    duration_mn: 60, // 9h-10h
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  const availability3: ProfessionalAvailability = {
    duration_mn: 60, // 10h-11h
    rrule: createWeeklyRRULE(new Date('2024-01-01T10:00:00Z'), null, 'MO'),
  };

  // Mission schedule covers 8:30h-10:30h (overlaps with all three)
  const missionSchedule: MissionSchedule = {
    duration_mn: 120, // 2 hours
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T08:30:00Z'),
      new Date('2024-01-29T08:30:00Z'),
      'MO'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability1, availability2, availability3],
    [missionSchedule],
    missionStart,
    missionEnd
  );

  // Should update all three availabilities
  assertEqual(
    result.toUpdate.length,
    3,
    'Should update all three availabilities'
  );

  // Each availability should stop before schedule dtstart (Jan 8 8:30am)
  const scheduleDtstart = new Date('2024-01-08T08:30:00Z');
  const expectedUntil = new Date(scheduleDtstart);
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);

  for (const update of result.toUpdate) {
    const updatedRule = rrulestr(update.newRrule);
    assert(
      updatedRule.options.until !== null &&
        updatedRule.options.until !== undefined &&
        Math.abs(
          updatedRule.options.until.getTime() - expectedUntil.getTime()
        ) < 60000,
      'Each availability should have UNTIL set to just before schedule dtstart'
    );
  }

  // Should create "before mission" parts for availability1 (8h-8:30h)
  // Should create "after mission" parts for availability3 (10:30h-11h)
  // Should create post-mission availabilities for all three
  const beforeMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart.getUTCHours() === 8 &&
      created.duration_mn < 60
    );
  });
  assertEqual(
    beforeMissionParts.length,
    1,
    'Should have one "before mission" part for availability1 (8h-8:30h)'
  );

  const afterMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart.getUTCHours() === 10 &&
      ruleObj.options.dtstart.getUTCMinutes() === 30 &&
      created.duration_mn < 60
    );
  });
  assertEqual(
    afterMissionParts.length,
    1,
    'Should have one "after mission" part for availability3 (10:30h-11h)'
  );

  // Should create post-mission availabilities for all three
  const scheduleUntil = new Date('2024-01-29T08:30:00Z');
  const postMissionAvailabilities = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart > scheduleUntil &&
      created.duration_mn === 60
    );
  });

  assertEqual(
    postMissionAvailabilities.length,
    3,
    'Should create one post-mission availability for each original availability'
  );
});
