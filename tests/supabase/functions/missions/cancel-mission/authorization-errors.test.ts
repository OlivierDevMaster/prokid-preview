// deno-lint-ignore-file no-explicit-any

import '@std/dotenv/load';
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

describe('Mission cancellation authorization errors', () => {
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

  it('should reject cancellation when user is not the creating structure', async () => {
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

    // Act - Try to cancel using professional token (not structure)
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdMission.id}/cancel`,
      token: fixture.professionalToken!,
    });

    // Assert
    MissionAssertions.assertForbidden(response, data);

    fixture.missionId = createdMission.id;
  });

  it('should reject cancellation when mission is already cancelled', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create and cancel a mission
    const createRequest = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      status: 'cancelled',
      structure_id: fixture.structureId!,
    };

    const { data: createdMission } = await apiHelper.invokeEndpoint({
      body: createRequest,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Act - Try to cancel an already cancelled mission
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${createdMission.id}/cancel`,
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertBadRequest(response, data, 'INVALID_STATUS');

    fixture.missionId = createdMission.id;
  });

  it('should reject cancellation when mission does not exist', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const nonExistentMissionId = '550e8400-e29b-41d4-a716-446655440999';

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'POST',
      name: 'missions',
      path: `/${nonExistentMissionId}/cancel`,
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertNotFound(response, data);
  });
});
