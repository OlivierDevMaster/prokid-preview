// deno-lint-ignore-file no-explicit-any

import '@std/dotenv/load';
import { assertEquals, assertExists } from '@std/assert';
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

describe('Mission creation overlap detection', () => {
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

  it('should reject mission that overlaps with accepted mission', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create a pending mission first, then accept it
    const pendingMissionRequest = {
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
      title: 'First Mission',
    };

    const { data: createdMission } = await apiHelper.invokeEndpoint({
      body: pendingMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    console.log('Created mission:', createdMission);
    console.log('Response status:', createdMission ? 'success' : 'failed');

    // Accept the mission
    const { data: acceptedMission } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdMission.id}/accept`,
      token: fixture.professionalToken!,
    });

    console.log('Accepted mission:', acceptedMission);
    console.log('Accepted mission status:', acceptedMission?.status);

    // Create overlapping mission request (same time slot)
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

    console.log('Overlapping request response status:', response.status);
    console.log('Overlapping request data:', JSON.stringify(data, null, 2));

    // Assert
    MissionAssertions.assertConflict(response, data, 'MISSION_OVERLAP');
    assertExists(data.error?.overlapping_date);

    // Track all missions for cleanup
    fixture.missionIds = [acceptedMission.id];
    if (data?.id) {
      fixture.missionIds.push(data.id);
    }
  });

  it('should allow mission that does not overlap with accepted mission', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create a pending mission on Monday, then accept it
    const pendingMissionRequest = {
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
      title: 'Accepted Monday Mission',
    };

    const { data: createdMission } = await apiHelper.invokeEndpoint({
      body: pendingMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    console.log('Created mission:', createdMission);

    // Accept the mission
    const { data: acceptedMission } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdMission.id}/accept`,
      token: fixture.professionalToken!,
    });

    console.log('Accepted mission:', acceptedMission);

    // Create non-overlapping mission on Wednesday
    const nonOverlappingRequest = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T09:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=WE',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Non-Overlapping Wednesday Mission',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: nonOverlappingRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    console.log('Non-overlapping request response status:', response.status);
    console.log('Non-overlapping request data:', JSON.stringify(data, null, 2));

    // Assert
    MissionAssertions.assertSuccessfulCreation(response, data);
    assertEquals(data.title, nonOverlappingRequest.title);

    // Track all missions for cleanup
    fixture.missionIds = [acceptedMission.id, data.id];
  });

  it('should allow mission that overlaps with pending mission', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create a pending mission
    const pendingMissionRequest = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      status: 'pending',
      structure_id: fixture.structureId!,
    };

    const { data: pendingMission } = await apiHelper.invokeEndpoint({
      body: pendingMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Create overlapping mission request (same time slot)
    const overlappingRequest = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      structure_id: fixture.structureId!,
      title: 'Overlapping Pending Mission',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: overlappingRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert - Should succeed because pending missions don't block
    MissionAssertions.assertSuccessfulCreation(response, data);

    // Track all missions for cleanup
    fixture.missionIds = [pendingMission.id, data.id];
  });
});
