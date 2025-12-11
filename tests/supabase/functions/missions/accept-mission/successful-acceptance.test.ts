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

    const { data: createdMission } = await apiHelper.invokeEndpoint({
      body: createRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdMission.id}/accept`,
      token: fixture.professionalToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulUpdate(response, data);
    assertEquals(data.status, 'accepted');
    assertEquals(data.id, createdMission.id);

    fixture.missionId = createdMission.id;
  });

  it('should reject acceptance when mission overlaps with another accepted mission', async () => {
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

    const { data: createdFirstMission } = await apiHelper.invokeEndpoint({
      body: firstMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Accept the first mission
    const { data: firstMission } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdFirstMission.id}/accept`,
      token: fixture.professionalToken!,
    });

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

    const { data: pendingMission } = await apiHelper.invokeEndpoint({
      body: overlappingRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Act - Try to accept the overlapping mission
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${pendingMission.id}/accept`,
      token: fixture.professionalToken!,
    });

    // Assert
    MissionAssertions.assertConflict(response, data, 'MISSION_OVERLAP');

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

    const { data: firstMission } = await apiHelper.invokeEndpoint({
      body: firstMissionRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

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

    const { data: pendingMission } = await apiHelper.invokeEndpoint({
      body: nonOverlappingRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Act - Accept the non-overlapping mission
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${pendingMission.id}/accept`,
      token: fixture.professionalToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulUpdate(response, data);
    assertEquals(data.status, 'accepted');

    // Cleanup
    fixture.missionId = firstMission.id;
  });
});
