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

describe('Mission acceptance edge cases', () => {
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

  it('should accept mission with multiple schedules', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create mission with multiple schedules
    const createRequest = {
      ...MissionTestData.validMissionRequestMultipleSchedules,
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

    // Verify all schedules are still present
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('*')
      .eq('mission_id', data.id);

    assertEquals(schedules?.length, 2);

    fixture.missionId = createdMission.id;
  });

  it('should accept mission with EXDATE in RRULE', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create mission with EXDATE
    const createRequest = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T09:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule:
            'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO\nEXDATE:20250608T090000Z',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Mission with EXDATE',
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

    fixture.missionId = createdMission.id;
  });

  it('should handle accepting mission that was previously declined', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create and decline a mission
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

    // Decline it first
    await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdMission.id}/decline`,
      token: fixture.professionalToken!,
    });

    // Act - Try to accept a declined mission
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdMission.id}/accept`,
      token: fixture.professionalToken!,
    });

    // Assert - Should fail because mission is declined, not pending
    MissionAssertions.assertBadRequest(response, data, 'INVALID_STATUS');

    fixture.missionId = createdMission.id;
  });
});
