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

  it('should create mission with overlap warnings when overlapping with accepted mission', async () => {
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

    const { data: createdMissionData } = await apiHelper.invokeEndpoint({
      body: pendingMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });
    const createdMission = createdMissionData.mission || createdMissionData;

    // Accept the mission
    const { data: acceptedMissionData } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdMission.id}/accept`,
      token: fixture.professionalToken!,
    });
    const acceptedMission = acceptedMissionData.mission || acceptedMissionData;

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

    // Assert - Mission should be created successfully with overlap warnings
    assertExists(data);
    const mission = data.mission || data;
    MissionAssertions.assertSuccessfulCreation(response, mission);
    assertEquals(mission.title, overlappingRequest.title);

    // Verify overlap information is present
    assertExists(data.overlaps);
    assertEquals(Array.isArray(data.overlaps), true);
    assertEquals(data.overlaps.length > 0, true);

    // Verify overlap structure
    data.overlaps.forEach(
      (overlap: { mission_id: string; overlapping_date: string }) => {
        MissionAssertions.assertOverlapStructure(overlap);
        assertEquals(overlap.mission_id, acceptedMission.id);
      }
    );

    // Track all missions for cleanup
    fixture.missionIds = [acceptedMission.id, mission.id];
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

    const { data: createdMissionData } = await apiHelper.invokeEndpoint({
      body: pendingMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });
    const createdMission = createdMissionData.mission || createdMissionData;

    // Accept the mission
    const { data: acceptedMissionData } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdMission.id}/accept`,
      token: fixture.professionalToken!,
    });
    const acceptedMission = acceptedMissionData.mission || acceptedMissionData;

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

    // Assert
    const mission = data.mission || data;
    MissionAssertions.assertSuccessfulCreation(response, mission);
    assertEquals(mission.title, nonOverlappingRequest.title);

    // Verify no overlap information when there are no overlaps
    if (data.overlaps !== undefined) {
      assertEquals(data.overlaps.length, 0);
    }

    // Track all missions for cleanup
    fixture.missionIds = [acceptedMission.id, mission.id];
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

    const { data: pendingMissionData } = await apiHelper.invokeEndpoint({
      body: pendingMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });
    const pendingMission = pendingMissionData.mission || pendingMissionData;

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
    const mission = data.mission || data;
    MissionAssertions.assertSuccessfulCreation(response, mission);

    // Verify no overlap information when overlapping with pending mission
    if (data.overlaps !== undefined) {
      assertEquals(data.overlaps.length, 0);
    }

    // Track all missions for cleanup
    fixture.missionIds = [pendingMission.id, mission.id];
  });
});
