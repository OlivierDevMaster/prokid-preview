// deno-lint-ignore-file no-explicit-any

import '@std/dotenv/load';
import { assertEquals } from '@std/assert';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../../helpers/SupabaseTestClient.ts';
import { MissionAssertions } from '../missions.assertion.ts';
import { MissionTestData } from '../missions.data.ts';
import {
  MissionCleanupHelper,
  MissionFixtureBuilder,
  MissionTestFixture,
} from '../missions.fixture.ts';

describe('Mission creation business logic errors', () => {
  let supabaseClient: SupabaseTestClient;
  let apiHelper: ApiTestHelper;
  let fixtureBuilder: MissionFixtureBuilder;
  let cleanupHelper: MissionCleanupHelper;
  let fixture: MissionTestFixture | null = null;

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    const adminClient = supabaseClient.createAdminClient();
    apiHelper = new ApiTestHelper(supabaseClient);
    fixtureBuilder = new MissionFixtureBuilder(adminClient, supabaseClient);
    cleanupHelper = new MissionCleanupHelper(adminClient);
  });

  afterEach(async () => {
    if (fixture) {
      await cleanupHelper.cleanupFixture(fixture);
      fixture = null;
    }
  });

  it('should handle partial overlap correctly (start time overlaps)', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create accepted mission: Monday 9am-11am (120 min)
    const acceptedMissionRequest = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T09:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      status: 'accepted',
      structure_id: fixture.structureId!,
      title: 'Accepted Mission',
    };

    const { data: acceptedMission } = await apiHelper.invokeEndpoint({
      body: acceptedMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Create overlapping mission: Monday 10am-12pm (overlaps with 9am-11am)
    const overlappingRequest = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T10:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T100000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Overlapping Mission',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: overlappingRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertConflict(response, data, 'MISSION_OVERLAP');

    fixture.missionId = acceptedMission.id;
  });

  it('should handle partial overlap correctly (end time overlaps)', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create accepted mission: Monday 10am-12pm (120 min)
    const acceptedMissionRequest = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T10:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T100000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      status: 'accepted',
      structure_id: fixture.structureId!,
      title: 'Accepted Mission',
    };

    const { data: acceptedMission } = await apiHelper.invokeEndpoint({
      body: acceptedMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Create overlapping mission: Monday 9am-11am (overlaps with 10am-12pm)
    const overlappingRequest = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T09:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Overlapping Mission',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: overlappingRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertConflict(response, data, 'MISSION_OVERLAP');

    fixture.missionId = acceptedMission.id;
  });

  it('should allow adjacent missions (no overlap)', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create accepted mission: Monday 9am-11am (120 min)
    const acceptedMissionRequest = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T09:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      status: 'accepted',
      structure_id: fixture.structureId!,
      title: 'Accepted Mission',
    };

    const { data: acceptedMission } = await apiHelper.invokeEndpoint({
      body: acceptedMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Create adjacent mission: Monday 11am-1pm (starts exactly when first ends)
    const adjacentRequest = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T11:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T110000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Adjacent Mission',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: adjacentRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert - Should succeed (adjacent, not overlapping)
    MissionAssertions.assertSuccessfulCreation(response, data);

    fixture.missionId = acceptedMission.id;
  });

  it('should handle multiple schedules with one overlapping', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create accepted mission: Monday 9am-11am
    const acceptedMissionRequest = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T09:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      status: 'accepted',
      structure_id: fixture.structureId!,
      title: 'Accepted Mission',
    };

    const { data: acceptedMission } = await apiHelper.invokeEndpoint({
      body: acceptedMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Create mission with multiple schedules, one overlapping
    const overlappingRequest = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T09:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO', // Overlaps
        },
        {
          duration_mn: 180,
          rrule: 'DTSTART:20250601T140000Z\nRRULE:FREQ=WEEKLY;BYDAY=WE', // Doesn't overlap
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Partially Overlapping Mission',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: overlappingRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert - Should reject because one schedule overlaps
    MissionAssertions.assertConflict(response, data, 'MISSION_OVERLAP');

    fixture.missionId = acceptedMission.id;
  });

  it('should handle RRULE with invalid DTSTART gracefully', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:INVALID\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Invalid DTSTART Mission',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertBadRequest(response, data, 'INVALID_RRULE');
  });

  it('should handle RRULE with missing DTSTART', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'RRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Missing DTSTART Mission',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert - Should either fail validation or use mission_dtstart as fallback
    // The constrainRRULEByDates function should handle this
    MissionAssertions.assertBadRequest(response, data, 'INVALID_RRULE');
  });

  it('should handle very short duration (1 minute)', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 1,
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Short Duration Mission',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulCreation(response, data);

    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('duration_mn')
      .eq('mission_id', data.id)
      .single();

    assertEquals(schedules?.duration_mn, 1);

    fixture.missionId = data.id;
  });

  it('should handle very long duration (480 minutes = 8 hours)', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 480,
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Long Duration Mission',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulCreation(response, data);

    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('duration_mn')
      .eq('mission_id', data.id)
      .single();

    assertEquals(schedules?.duration_mn, 480);

    fixture.missionId = data.id;
  });
});
