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

describe('Successful mission acceptance', () => {
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

  it('should accept a pending mission', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create a pending mission
    const createRequest = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      structure_id: fixture.structureId!,
    };

    const { data: createdMissionData } = await apiHelper.invokeEndpoint({
      body: createRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });
    const createdMission = createdMissionData.mission || createdMissionData;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdMission.id}/accept`,
      token: fixture.professionalToken!,
    });

    // Assert
    const mission = data.mission || data;
    MissionAssertions.assertSuccessfulUpdate(response, mission);
    assertEquals(mission.status, 'accepted');
    assertEquals(mission.id, createdMission.id);

    // Verify no overlap information when there are no overlaps
    if (data.overlaps !== undefined) {
      assertEquals(data.overlaps.length, 0);
    }

    fixture.missionId = createdMission.id;
  });

  it('should allow acceptance when mission overlaps with another accepted mission and return overlap warnings', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create and accept first mission
    const firstMissionRequest = {
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
      title: 'First Accepted Mission',
    };

    const { data: createdFirstMissionData } = await apiHelper.invokeEndpoint({
      body: firstMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });
    const createdFirstMission =
      createdFirstMissionData.mission || createdFirstMissionData;

    // Accept the first mission
    const { data: firstMissionData } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdFirstMission.id}/accept`,
      token: fixture.professionalToken!,
    });
    const firstMission = firstMissionData.mission || firstMissionData;

    // Create overlapping pending mission
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
      title: 'Overlapping Pending Mission',
    };

    const { data: pendingMissionData, response: createResponse } =
      await apiHelper.invokeEndpoint({
        body: overlappingRequest,
        method: 'POST',
        name: 'missions',
        path: '/',
        token: fixture.structureToken!,
      });
    const pendingMission = pendingMissionData.mission || pendingMissionData;

    // Verify mission was created successfully
    MissionAssertions.assertSuccessfulCreation(createResponse, pendingMission);
    assertEquals(pendingMission.status, 'pending');
    assertExists(pendingMission.id, 'Pending mission must have an ID');

    // Act - Accept the overlapping mission (should be allowed)
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${pendingMission.id}/accept`,
      token: fixture.professionalToken!,
    });

    // Assert - Should succeed with overlap warnings
    assertExists(data);
    const mission = data.mission || data;
    MissionAssertions.assertSuccessfulUpdate(response, mission);
    assertEquals(mission.status, 'accepted');
    assertEquals(mission.id, pendingMission.id);

    // Verify overlap information is present
    assertExists(data.overlaps);
    assertEquals(Array.isArray(data.overlaps), true);
    assertEquals(data.overlaps.length > 0, true);

    // Verify overlap structure
    data.overlaps.forEach(
      (overlap: { mission_id: string; overlapping_date: string }) => {
        MissionAssertions.assertOverlapStructure(overlap);
        assertEquals(overlap.mission_id, firstMission.id);
      }
    );

    // Track all missions for cleanup
    fixture.missionIds = [firstMission.id, pendingMission.id];
  });

  it('should allow acceptance when mission does not overlap', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create and accept first mission on Monday
    const firstMissionRequest = {
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
      title: 'Accepted Monday Mission',
    };

    const { data: firstMissionData } = await apiHelper.invokeEndpoint({
      body: firstMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });
    const firstMission = firstMissionData.mission || firstMissionData;

    // Create non-overlapping pending mission on Wednesday
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
      title: 'Pending Wednesday Mission',
    };

    const { data: pendingMissionData } = await apiHelper.invokeEndpoint({
      body: nonOverlappingRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });
    const pendingMission = pendingMissionData.mission || pendingMissionData;

    // Act - Accept the non-overlapping mission
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${pendingMission.id}/accept`,
      token: fixture.professionalToken!,
    });

    // Assert
    const mission = data.mission || data;
    MissionAssertions.assertSuccessfulUpdate(response, mission);
    assertEquals(mission.status, 'accepted');

    // Verify no overlap information when there are no overlaps
    if (data.overlaps !== undefined) {
      assertEquals(data.overlaps.length, 0);
    }

    // Cleanup
    fixture.missionIds = [firstMission.id, mission.id];
  });
});
