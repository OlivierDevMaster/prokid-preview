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

test('should handle two schedules with different time periods affecting same availability', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Schedule 1: Every Monday 10am-11am (Jan 8-15)
  const schedule1: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-15T10:00:00Z'),
      'MO'
    ),
  };

  // Schedule 2: Every Monday 10:30am-11:30am (Jan 16-22)
  const schedule2: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-16T10:30:00Z'),
      new Date('2024-01-22T10:30:00Z'),
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
    'Should have one availability to update'
  );

  // Original should stop before earliest schedule dtstart (Jan 8 10am)
  const updatedRule = rrulestr(result.toUpdate[0].newRrule);
  const earliestScheduleDtstart = new Date('2024-01-08T10:00:00Z');
  const expectedUntil = new Date(earliestScheduleDtstart);
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);
  assert(
    updatedRule.options.until !== null &&
      updatedRule.options.until !== undefined &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before earliest schedule dtstart (Jan 8 10am)'
  );

  // Should create "before mission" parts for both schedules
  // Schedule 1: 9am-10am, Schedule 2: 9am-10:30am
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
  assertEqual(
    beforeMissionParts.length,
    2,
    'Should have two "before mission" parts (one for each schedule)'
  );

  // Should create "after mission" parts for both schedules
  // Schedule 1: 11am-12pm, Schedule 2: 11:30am-12pm
  const afterMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart.getUTCHours() >= 11 &&
      created.duration_mn < 180
    );
  });
  assertEqual(
    afterMissionParts.length,
    2,
    'Should have two "after mission" parts (one for each schedule)'
  );

  // Should create only one post-mission availability (using latest schedule until = Jan 22)
  const postMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart > new Date('2024-01-22T10:30:00Z') &&
      created.duration_mn === 180
    );
  });
  assertEqual(
    postMissionParts.length,
    1,
    'Should have only one post-mission availability (using latest schedule until)'
  );

  // Verify post-mission starts after latest schedule until (Jan 22)
  const postMissionRule = rrulestr(postMissionParts[0].rrule);
  const latestScheduleUntil = new Date('2024-01-22T10:30:00Z');
  assert(
    postMissionRule.options.dtstart &&
      postMissionRule.options.dtstart > latestScheduleUntil,
    'Post-mission should start after latest schedule until (Jan 22)'
  );
});

test('should handle two overlapping schedules affecting same availability', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Schedule 1: Every Monday 10am-11am (Jan 8-22)
  const schedule1: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-22T10:00:00Z'),
      'MO'
    ),
  };

  // Schedule 2: Every Monday 10:30am-11:30am (Jan 8-22) - overlaps with schedule 1
  const schedule2: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:30:00Z'),
      new Date('2024-01-22T10:30:00Z'),
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
    'Should have one availability to update'
  );

  // Original should stop before earliest schedule dtstart (both start at Jan 8 10am)
  const updatedRule = rrulestr(result.toUpdate[0].newRrule);
  const earliestScheduleDtstart = new Date('2024-01-08T10:00:00Z');
  const expectedUntil = new Date(earliestScheduleDtstart);
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);
  assert(
    updatedRule.options.until !== null &&
      updatedRule.options.until !== undefined &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before earliest schedule dtstart'
  );

  // Should create "before mission" parts for both schedules
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
  assertEqual(
    beforeMissionParts.length,
    2,
    'Should have two "before mission" parts (one for each schedule)'
  );

  // Should create "after mission" parts for both schedules
  const afterMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart.getUTCHours() >= 11 &&
      created.duration_mn < 180
    );
  });
  assertEqual(
    afterMissionParts.length,
    2,
    'Should have two "after mission" parts (one for each schedule)'
  );

  // Should create only one post-mission availability
  const postMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart > new Date('2024-01-22T10:30:00Z') &&
      created.duration_mn === 180
    );
  });
  assertEqual(
    postMissionParts.length,
    1,
    'Should have only one post-mission availability'
  );
});

test('should handle schedule starting before another ends', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Schedule 1: Every Monday 10am-11am (Jan 8-15)
  const schedule1: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-15T10:00:00Z'),
      'MO'
    ),
  };

  // Schedule 2: Every Monday 10am-11am (Jan 16-22) - starts right after schedule 1 ends
  const schedule2: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-16T10:00:00Z'),
      new Date('2024-01-22T10:00:00Z'),
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
    'Should have one availability to update'
  );

  // Original should stop before earliest schedule dtstart (Jan 8 10am)
  const updatedRule = rrulestr(result.toUpdate[0].newRrule);
  const earliestScheduleDtstart = new Date('2024-01-08T10:00:00Z');
  const expectedUntil = new Date(earliestScheduleDtstart);
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);
  assert(
    updatedRule.options.until !== null &&
      updatedRule.options.until !== undefined &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before earliest schedule dtstart (Jan 8 10am)'
  );

  // Should create "before mission" and "after mission" parts for both schedules
  // Total: 2 before + 2 after + 1 post-mission = 5 created availabilities
  assertEqual(
    result.toCreate.length,
    5,
    'Should have 5 created availabilities (2 before + 2 after + 1 post-mission)'
  );

  // Should create only one post-mission availability (using latest schedule until = Jan 22)
  const postMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart > new Date('2024-01-22T10:00:00Z') &&
      created.duration_mn === 180
    );
  });
  assertEqual(
    postMissionParts.length,
    1,
    'Should have only one post-mission availability (using latest schedule until)'
  );
});

test('should handle three schedules affecting same availability', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Schedule 1: Every Monday 10am-11am (Jan 8-10)
  const schedule1: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-10T10:00:00Z'),
      'MO'
    ),
  };

  // Schedule 2: Every Monday 10:30am-11:30am (Jan 15-17)
  const schedule2: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-15T10:30:00Z'),
      new Date('2024-01-17T10:30:00Z'),
      'MO'
    ),
  };

  // Schedule 3: Every Monday 11am-12pm (Jan 22-24)
  const schedule3: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-22T11:00:00Z'),
      new Date('2024-01-24T11:00:00Z'),
      'MO'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability],
    [schedule1, schedule2, schedule3],
    missionStart,
    missionEnd
  );

  // Should update the original availability
  assertEqual(
    result.toUpdate.length,
    1,
    'Should have one availability to update'
  );

  // Original should stop before earliest schedule dtstart (Jan 8 10am)
  const updatedRule = rrulestr(result.toUpdate[0].newRrule);
  const earliestScheduleDtstart = new Date('2024-01-08T10:00:00Z');
  const expectedUntil = new Date(earliestScheduleDtstart);
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);
  assert(
    updatedRule.options.until !== null &&
      updatedRule.options.until !== undefined &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before earliest schedule dtstart (Jan 8 10am)'
  );

  // Should create "before mission" and "after mission" parts for all three schedules
  // Schedule 1: before (9am-10am) + after (11am-12pm)
  // Schedule 2: before (9am-10:30am) + after (11:30am-12pm)
  // Schedule 3: before (9am-11am) only (mission at end)
  // Total: 3 before + 2 after + 1 post-mission = 6 created availabilities
  assertEqual(
    result.toCreate.length,
    6,
    'Should have 6 created availabilities (3 before + 2 after + 1 post-mission)'
  );

  // Should create only one post-mission availability (using latest schedule until = Jan 24)
  const postMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart > new Date('2024-01-24T11:00:00Z') &&
      created.duration_mn === 180
    );
  });
  assertEqual(
    postMissionParts.length,
    1,
    'Should have only one post-mission availability (using latest schedule until)'
  );

  // Verify post-mission starts after latest schedule until (Jan 24)
  const postMissionRule = rrulestr(postMissionParts[0].rrule);
  const latestScheduleUntil = new Date('2024-01-24T11:00:00Z');
  assert(
    postMissionRule.options.dtstart &&
      postMissionRule.options.dtstart > latestScheduleUntil,
    'Post-mission should start after latest schedule until (Jan 24)'
  );
});

test('should handle schedules with different patterns affecting same availability', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Schedule 1: Every Monday 10am-11am (Jan 8-22) - Mon-Fri pattern
  const schedule1: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-22T10:00:00Z'),
      'MO'
    ),
  };

  // Schedule 2: Every Wednesday 10:30am-11:30am (Jan 10-24) - different day
  // Note: This won't overlap with Monday availability, but let's test the structure
  const schedule2: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-10T10:30:00Z'),
      new Date('2024-01-24T10:30:00Z'),
      'WE'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability],
    [schedule1, schedule2],
    missionStart,
    missionEnd
  );

  // Only schedule1 should affect Monday availability (schedule2 is Wednesday)
  // Should update the original availability
  assertEqual(
    result.toUpdate.length,
    1,
    'Should have one availability to update'
  );

  // Should create parts for schedule1 only
  // Schedule1: before (9am-10am) + after (11am-12pm) + post-mission
  assertEqual(
    result.toCreate.length,
    3,
    'Should have 3 created availabilities (1 before + 1 after + 1 post-mission for schedule1 only)'
  );
});

test('should handle schedule at start and schedule at end of same availability', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Schedule 1: Every Monday 9am-10am (Jan 8-15) - at start
  const schedule1: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-15T09:00:00Z'),
      'MO'
    ),
  };

  // Schedule 2: Every Monday 11am-12pm (Jan 16-22) - at end
  const schedule2: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-16T11:00:00Z'),
      new Date('2024-01-22T11:00:00Z'),
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
    'Should have one availability to update'
  );

  // Original should stop before earliest schedule dtstart (Jan 8 9am)
  const updatedRule = rrulestr(result.toUpdate[0].newRrule);
  const earliestScheduleDtstart = new Date('2024-01-08T09:00:00Z');
  const expectedUntil = new Date(earliestScheduleDtstart);
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);
  assert(
    updatedRule.options.until !== null &&
      updatedRule.options.until !== undefined &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before earliest schedule dtstart (Jan 8 9am)'
  );

  // Schedule 1: after mission part (10am-12pm)
  // Schedule 2: before mission part (9am-11am)
  // Total: 1 before + 1 after + 1 post-mission = 3 created availabilities
  assertEqual(
    result.toCreate.length,
    3,
    'Should have 3 created availabilities (1 before + 1 after + 1 post-mission)'
  );

  // Should create only one post-mission availability (using latest schedule until = Jan 22)
  const postMissionParts = result.toCreate.filter(created => {
    const rule = rrulestr(created.rrule);
    const ruleObj =
      rule instanceof RRuleSet
        ? (rule as RRuleSet).rrules()[0]
        : (rule as RRule);
    return (
      ruleObj.options.dtstart &&
      ruleObj.options.dtstart > new Date('2024-01-22T11:00:00Z') &&
      created.duration_mn === 180
    );
  });
  assertEqual(
    postMissionParts.length,
    1,
    'Should have only one post-mission availability (using latest schedule until)'
  );
});
