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
    updatedRule.options.until &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before first mission occurrence'
  );

  // Should create a new availability after mission (11am-12pm)
  assertEqual(
    result.toCreate.length,
    1,
    'Should have one availability to create'
  );
  assertEqual(
    result.toCreate[0].duration_mn,
    60,
    'New availability should be 1 hour (11am-12pm)'
  );

  // Verify the created availability's RRULE
  const createdRule = rrulestr(result.toCreate[0].rrule);
  assert(
    createdRule.options.dtstart !== undefined,
    'Created availability should have DTSTART'
  );
  const expectedStart = new Date('2024-01-08T11:00:00Z');
  assert(
    createdRule.options.dtstart &&
      Math.abs(
        createdRule.options.dtstart.getTime() - expectedStart.getTime()
      ) < 60000,
    'DTSTART should be at the end of first mission occurrence (11am)'
  );
  // Since original availability had no UNTIL, created one should also have no UNTIL
  assert(
    createdRule.options.until === null ||
      createdRule.options.until === undefined,
    'Created availability should NOT have UNTIL when original had none (continues indefinitely)'
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

  // Should create a new availability after mission (10am-12pm)
  assertEqual(
    result.toCreate.length,
    1,
    'Should have one availability to create'
  );
  assertEqual(
    result.toCreate[0].duration_mn,
    120,
    'New availability should be 2 hours (10am-12pm)'
  );

  // Verify the created availability continues after mission ends
  const createdRule = rrulestr(result.toCreate[0].rrule);
  // Since original availability had no UNTIL, created one should also have no UNTIL
  assert(
    createdRule.options.until === null ||
      createdRule.options.until === undefined,
    'Created availability should NOT have UNTIL when original had none (continues indefinitely)'
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
    updatedRule.options.until &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before first mission occurrence'
  );

  // Should not create new availability (mission is at the end)
  assertEqual(
    result.toCreate.length,
    0,
    'Should not create new availability when mission is at the end'
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
    updatedRule.options.until &&
      Math.abs(updatedRule.options.until.getTime() - expectedUntil.getTime()) <
        60000,
    'UNTIL should be set to just before first mission occurrence'
  );

  // Should not create new availability (mission covers everything)
  assertEqual(
    result.toCreate.length,
    0,
    'Should not create new availability when mission covers entire availability'
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

  // Should create an availability that continues after mission ends
  assertEqual(
    result.toCreate.length,
    1,
    'Should have one availability to create'
  );

  const createdRule = rrulestr(result.toCreate[0].rrule);

  // Since original availability had no UNTIL, created one should also have no UNTIL
  assert(
    createdRule.options.until === null ||
      createdRule.options.until === undefined,
    'Created availability should NOT have UNTIL when original had none (continues indefinitely)'
  );

  // Verify it generates occurrences after the mission period
  const occurrencesAfterMission = createdRule.between(
    new Date('2024-02-05T00:00:00Z'), // First Monday after mission ends
    new Date('2024-02-12T23:59:59Z'),
    true
  );
  assert(
    occurrencesAfterMission.length > 0,
    'Created availability should generate occurrences after mission ends'
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

  // Should create an availability that preserves the original UNTIL
  assertEqual(
    result.toCreate.length,
    1,
    'Should have one availability to create'
  );

  const createdRule = rrulestr(result.toCreate[0].rrule);

  // Verify it preserves the original UNTIL
  assert(
    createdRule.options.until !== null &&
      createdRule.options.until !== undefined,
    'Created availability should preserve original UNTIL'
  );
  assert(
    createdRule.options.until &&
      Math.abs(
        createdRule.options.until.getTime() - availabilityUntil.getTime()
      ) < 60000,
    'Created availability should have the same UNTIL as original'
  );
});
