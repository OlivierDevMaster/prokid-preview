import { rrulestr } from 'rrule';

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

test('should split availability when mission is in the middle', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Mission: Every Monday 10am-11am (1 hour, in middle of availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability],
    [missionSchedule],
    missionStart,
    missionEnd
  );

  // Should update the original availability to end before mission (9am-10am)
  assertEqual(
    result.toUpdate.length,
    1,
    'Should have one availability to update'
  );
  assert(
    result.toUpdate[0].originalAvailability === availability,
    'Should update the original availability'
  );

  // Verify the updated RRULE has UNTIL set to just before the first mission occurrence
  const updatedRule = rrulestr(result.toUpdate[0].newRrule);
  assert(
    updatedRule.options.until !== undefined,
    'Updated availability should have UNTIL set'
  );
  const firstMissionOcc = new Date('2024-01-08T10:00:00Z');
  const expectedUntil = new Date(firstMissionOcc);
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);
  assert(
    updatedRule.options.until !== null &&
      updatedRule.options.until !== undefined &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before first mission occurrence'
  );

  // Should create three availabilities:
  // 1. Before mission part during schedule period: 9am-10am (dtstart = A, until = B)
  // 2. After mission part during schedule period: 11am-12pm (dtstart = A, until = B)
  // 3. Post-mission: 9am-12pm (dtstart = B, until = original until)
  assertEqual(
    result.toCreate.length,
    3,
    'Should have three availabilities to create (before mission, after mission, post-mission)'
  );

  // Schedule dates from the mission schedule RRULE
  const scheduleDtstart = new Date('2024-01-08T10:00:00Z'); // A - first schedule occurrence
  const scheduleUntil = new Date('2024-01-29T10:00:00Z'); // B - schedule until

  // First created availability: before mission part (9am-10am, dtstart = A, until = B)
  const beforeMissionRule = rrulestr(result.toCreate[0].rrule);
  assertEqual(
    result.toCreate[0].duration_mn,
    60,
    'First availability should be 1 hour (9am-10am before mission)'
  );
  assert(
    beforeMissionRule.options.dtstart !== undefined,
    'Before-mission availability should have DTSTART'
  );
  // DTSTART should be at schedule dtstart (A) with time 9am
  const expectedBeforeStart = new Date(scheduleDtstart);
  expectedBeforeStart.setUTCHours(9, 0, 0, 0);
  assert(
    beforeMissionRule.options.dtstart &&
      Math.abs(
        beforeMissionRule.options.dtstart.getTime() -
          expectedBeforeStart.getTime()
      ) < 60000,
    'DTSTART should be at schedule dtstart (A) with time 9am'
  );
  assert(
    beforeMissionRule.options.until !== null &&
      beforeMissionRule.options.until !== undefined &&
      Math.abs(
        beforeMissionRule.options.until.getTime() - scheduleUntil.getTime()
      ) < 60000,
    'UNTIL should be set to schedule until (B)'
  );

  // Second created availability: after mission part (11am-12pm, dtstart = A, until = B)
  const afterMissionRule = rrulestr(result.toCreate[1].rrule);
  assertEqual(
    result.toCreate[1].duration_mn,
    60,
    'Second availability should be 1 hour (11am-12pm after mission)'
  );
  assert(
    afterMissionRule.options.dtstart !== undefined,
    'After-mission availability should have DTSTART'
  );
  // DTSTART should be at schedule dtstart (A) with time 11am
  const expectedAfterStart = new Date(scheduleDtstart);
  expectedAfterStart.setUTCHours(11, 0, 0, 0);
  assert(
    afterMissionRule.options.dtstart &&
      Math.abs(
        afterMissionRule.options.dtstart.getTime() -
          expectedAfterStart.getTime()
      ) < 60000,
    'DTSTART should be at schedule dtstart (A) with time 11am'
  );
  assert(
    afterMissionRule.options.until !== null &&
      afterMissionRule.options.until !== undefined &&
      Math.abs(
        afterMissionRule.options.until.getTime() - scheduleUntil.getTime()
      ) < 60000,
    'UNTIL should be set to schedule until (B)'
  );

  // Third created availability: post-mission (9am-12pm, dtstart = B, until = original until)
  const postMissionRule = rrulestr(result.toCreate[2].rrule);
  assertEqual(
    result.toCreate[2].duration_mn,
    180,
    'Post-mission availability should be 3 hours (9am-12pm, full pattern)'
  );
  // Should start after schedule until (B)
  assert(
    postMissionRule.options.dtstart !== undefined,
    'Post-mission availability should have DTSTART'
  );
  assert(
    postMissionRule.options.dtstart &&
      postMissionRule.options.dtstart > scheduleUntil,
    'Post-mission availability should start after schedule until (B)'
  );
  // Since original availability had no UNTIL, post-mission one should also have no UNTIL
  assert(
    postMissionRule.options.until === null ||
      postMissionRule.options.until === undefined,
    'Post-mission availability should NOT have UNTIL when original had none (continues indefinitely)'
  );
});

test('should truncate availability when mission is at the start', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Mission: Every Monday 9am-10am (1 hour, at start of availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-29T09:00:00Z'),
      'MO'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability],
    [missionSchedule],
    missionStart,
    missionEnd
  );

  // Should update the original availability to end before mission
  assertEqual(
    result.toUpdate.length,
    1,
    'Should have one availability to update'
  );

  // Verify the updated RRULE has UNTIL set correctly
  const updatedRule = rrulestr(result.toUpdate[0].newRrule);
  assert(
    updatedRule.options.until !== undefined,
    'Updated availability should have UNTIL set'
  );

  // Should create two availabilities:
  // 1. After mission part during schedule period: 10am-12pm (dtstart = A, until = B)
  // 2. Post-mission: 9am-12pm (dtstart = B, until = original until)
  assertEqual(
    result.toCreate.length,
    2,
    'Should have two availabilities to create (after mission part and post-mission)'
  );

  // Schedule dates from the mission schedule RRULE
  const scheduleDtstart = new Date('2024-01-08T09:00:00Z'); // A
  const scheduleUntil = new Date('2024-01-29T09:00:00Z'); // B

  // First created availability: after mission part (10am-12pm, dtstart = A, until = B)
  const afterMissionRule = rrulestr(result.toCreate[0].rrule);
  assertEqual(
    result.toCreate[0].duration_mn,
    120,
    'First availability should be 2 hours (10am-12pm after mission)'
  );
  // DTSTART should be at schedule dtstart (A) with time 10am
  const expectedAfterStart = new Date(scheduleDtstart);
  expectedAfterStart.setUTCHours(10, 0, 0, 0);
  assert(
    afterMissionRule.options.dtstart !== undefined,
    'After-mission availability should have DTSTART'
  );
  assert(
    afterMissionRule.options.dtstart &&
      Math.abs(
        afterMissionRule.options.dtstart.getTime() -
          expectedAfterStart.getTime()
      ) < 60000,
    'DTSTART should be at schedule dtstart (A) with time 10am'
  );
  assert(
    afterMissionRule.options.until !== null &&
      afterMissionRule.options.until !== undefined &&
      Math.abs(
        afterMissionRule.options.until.getTime() - scheduleUntil.getTime()
      ) < 60000,
    'UNTIL should be set to schedule until (B)'
  );

  // Second created availability: post-mission (9am-12pm, dtstart = B, until = original until)
  const postMissionRule = rrulestr(result.toCreate[1].rrule);
  assertEqual(
    result.toCreate[1].duration_mn,
    180,
    'Post-mission availability should be 3 hours (9am-12pm, full pattern)'
  );
  // Should start after schedule until (B)
  assert(
    postMissionRule.options.dtstart !== undefined,
    'Post-mission availability should have DTSTART'
  );
  assert(
    postMissionRule.options.dtstart &&
      postMissionRule.options.dtstart > scheduleUntil,
    'Post-mission availability should start after schedule until (B)'
  );
  // Since original availability had no UNTIL, post-mission one should also have no UNTIL
  assert(
    postMissionRule.options.until === null ||
      postMissionRule.options.until === undefined,
    'Post-mission availability should NOT have UNTIL when original had none (continues indefinitely)'
  );
});

test('should truncate availability when mission is at the end', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Mission: Every Monday 11am-12pm (1 hour, at end of availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T11:00:00Z'),
      new Date('2024-01-29T11:00:00Z'),
      'MO'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability],
    [missionSchedule],
    missionStart,
    missionEnd
  );

  // Should update the original availability to end before mission (9am-11am)
  assertEqual(
    result.toUpdate.length,
    1,
    'Should have one availability to update'
  );

  // Verify the updated RRULE has UNTIL set correctly
  const updatedRule = rrulestr(result.toUpdate[0].newRrule);
  assert(
    updatedRule.options.until !== undefined,
    'Updated availability should have UNTIL set'
  );
  const firstMissionOcc = new Date('2024-01-08T11:00:00Z');
  const expectedUntil = new Date(firstMissionOcc);
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);
  assert(
    updatedRule.options.until !== null &&
      updatedRule.options.until !== undefined &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before first mission occurrence'
  );

  // Should create two availabilities:
  // 1. Before mission part during schedule period: 9am-11am (dtstart = A, until = B)
  // 2. Post-mission: 9am-12pm (dtstart = B, until = original until)
  assertEqual(
    result.toCreate.length,
    2,
    'Should have two availabilities to create (before mission part and post-mission)'
  );

  // Schedule dates from the mission schedule RRULE
  const scheduleDtstart = new Date('2024-01-08T11:00:00Z'); // A
  const scheduleUntil = new Date('2024-01-29T11:00:00Z'); // B

  // First created availability: before mission part (9am-11am, dtstart = A, until = B)
  const beforeMissionRule = rrulestr(result.toCreate[0].rrule);
  assertEqual(
    result.toCreate[0].duration_mn,
    120,
    'First availability should be 2 hours (9am-11am before mission)'
  );
  // DTSTART should be at schedule dtstart (A) with time 9am
  const expectedBeforeStart = new Date(scheduleDtstart);
  expectedBeforeStart.setUTCHours(9, 0, 0, 0);
  assert(
    beforeMissionRule.options.dtstart !== undefined,
    'Before-mission availability should have DTSTART'
  );
  assert(
    beforeMissionRule.options.dtstart &&
      Math.abs(
        beforeMissionRule.options.dtstart.getTime() -
          expectedBeforeStart.getTime()
      ) < 60000,
    'DTSTART should be at schedule dtstart (A) with time 9am'
  );
  assert(
    beforeMissionRule.options.until !== null &&
      beforeMissionRule.options.until !== undefined &&
      Math.abs(
        beforeMissionRule.options.until.getTime() - scheduleUntil.getTime()
      ) < 60000,
    'UNTIL should be set to schedule until (B)'
  );

  // Second created availability: post-mission (9am-12pm, dtstart = B, until = original until)
  const postMissionRule = rrulestr(result.toCreate[1].rrule);
  assertEqual(
    result.toCreate[1].duration_mn,
    180,
    'Post-mission availability should be 3 hours (9am-12pm, full pattern)'
  );
  // Should start after schedule until (B)
  assert(
    postMissionRule.options.dtstart !== undefined,
    'Post-mission availability should have DTSTART'
  );
  assert(
    postMissionRule.options.dtstart &&
      postMissionRule.options.dtstart > scheduleUntil,
    'Post-mission availability should start after schedule until (B)'
  );
  // Since original availability had no UNTIL, post-mission one should also have no UNTIL
  assert(
    postMissionRule.options.until === null ||
      postMissionRule.options.until === undefined,
    'Post-mission availability should NOT have UNTIL when original had none (continues indefinitely)'
  );
});

test('should handle mission covering entire availability', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Mission: Every Monday 9am-12pm (3 hours, covers entire availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T09:00:00Z'),
      new Date('2024-01-29T09:00:00Z'),
      'MO'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability],
    [missionSchedule],
    missionStart,
    missionEnd
  );

  // Should update the original availability to end before mission
  assertEqual(
    result.toUpdate.length,
    1,
    'Should have one availability to update'
  );

  // Verify the updated RRULE has UNTIL set correctly
  const updatedRule = rrulestr(result.toUpdate[0].newRrule);
  assert(
    updatedRule.options.until !== undefined,
    'Updated availability should have UNTIL set'
  );
  const firstMissionOcc = new Date('2024-01-08T09:00:00Z');
  const expectedUntil = new Date(firstMissionOcc);
  expectedUntil.setSeconds(expectedUntil.getSeconds() - 1);
  assert(
    updatedRule.options.until !== null &&
      updatedRule.options.until !== undefined &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before first mission occurrence'
  );

  // Should create one availability: post-mission (9am-12pm, dtstart = B, until = original until)
  assertEqual(
    result.toCreate.length,
    1,
    'Should have one availability to create (post-mission full pattern)'
  );

  // Schedule dates from the mission schedule RRULE
  const scheduleUntil = new Date('2024-01-29T09:00:00Z'); // B

  const postMissionRule = rrulestr(result.toCreate[0].rrule);
  assertEqual(
    result.toCreate[0].duration_mn,
    180,
    'Post-mission availability should be 3 hours (9am-12pm, full pattern)'
  );
  // Should start after schedule until (B)
  assert(
    postMissionRule.options.dtstart !== undefined,
    'Post-mission availability should have DTSTART'
  );
  assert(
    postMissionRule.options.dtstart &&
      postMissionRule.options.dtstart > scheduleUntil,
    'Post-mission availability should start after schedule until (B)'
  );
  // Since original availability had no UNTIL, post-mission one should also have no UNTIL
  assert(
    postMissionRule.options.until === null ||
      postMissionRule.options.until === undefined,
    'Post-mission availability should NOT have UNTIL when original had none (continues indefinitely)'
  );
});

test('should verify created availability continues after mission ends', () => {
  // Availability: Every Monday 9am-12pm (3 hours)
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(new Date('2024-01-01T09:00:00Z'), null, 'MO'),
  };

  // Mission: Every Monday 10am-11am (1 hour, in middle of availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability],
    [missionSchedule],
    missionStart,
    missionEnd
  );

  // Should create three availabilities (before mission, after mission, post-mission)
  assertEqual(
    result.toCreate.length,
    3,
    'Should have three availabilities to create (before mission, after mission, post-mission)'
  );

  // Check the post-mission availability (third one) - should continue after mission ends
  const postMissionRule = rrulestr(result.toCreate[2].rrule);

  // Since original availability had no UNTIL, post-mission one should also have no UNTIL
  assert(
    postMissionRule.options.until === null ||
      postMissionRule.options.until === undefined,
    'Post-mission availability should NOT have UNTIL when original had none (continues indefinitely)'
  );

  // Verify it generates occurrences after the mission period
  const occurrencesAfterMission = postMissionRule.between(
    new Date('2024-02-05T00:00:00Z'), // First Monday after mission ends
    new Date('2024-02-12T23:59:59Z'),
    true
  );
  assert(
    occurrencesAfterMission.length > 0,
    'Post-mission availability should generate occurrences after mission ends'
  );
});

test('should preserve UNTIL when original availability had one', () => {
  // Availability: Every Monday 9am-12pm (3 hours) until end of February
  const availabilityUntil = new Date('2024-02-29T23:59:59Z');
  const availability: ProfessionalAvailability = {
    duration_mn: 180,
    rrule: createWeeklyRRULE(
      new Date('2024-01-01T09:00:00Z'),
      availabilityUntil,
      'MO'
    ),
  };

  // Mission: Every Monday 10am-11am (1 hour, in middle of availability)
  const missionSchedule: MissionSchedule = {
    duration_mn: 60,
    rrule: createWeeklyRRULE(
      new Date('2024-01-08T10:00:00Z'),
      new Date('2024-01-29T10:00:00Z'),
      'MO'
    ),
  };

  const result = updateAvailabilitiesForMissions(
    [availability],
    [missionSchedule],
    missionStart,
    missionEnd
  );

  // Should create three availabilities (before mission, after mission, post-mission)
  assertEqual(
    result.toCreate.length,
    3,
    'Should have three availabilities to create (before mission, after mission, post-mission)'
  );

  // Check the post-mission availability (third one) - should preserve original UNTIL
  const postMissionRule = rrulestr(result.toCreate[2].rrule);

  // Verify it preserves the original UNTIL
  assert(
    postMissionRule.options.until !== null &&
      postMissionRule.options.until !== undefined,
    'Post-mission availability should preserve original UNTIL'
  );
  assert(
    postMissionRule.options.until !== null &&
      postMissionRule.options.until !== undefined &&
      Math.abs(
        postMissionRule.options.until.getTime() - availabilityUntil.getTime()
      ) < 60000,
    'Post-mission availability should have the same UNTIL as original'
  );
});
