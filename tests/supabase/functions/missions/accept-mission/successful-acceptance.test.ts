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

    fixture.missionId = createdMission.id;
  });
});
