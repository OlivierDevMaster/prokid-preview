import '@std/dotenv/load';
import { assertEquals, assertExists } from '@std/assert';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  MissionCleanupHelper,
  MissionFixtureBuilder,
  MissionTestFixture,
} from '../missions/missions.fixture.ts';
import { MissionDurationsAssertions } from './missionDurations.assertion.ts';

describe('Mission durations authorization errors', () => {
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

  it('should return 401 when user is not authenticated', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Act
    const { response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/',
      queryParams: {
        professional_id: fixture.professionalId!,
        structure_id: fixture.structureId!,
      },
      token: null,
    });

    // Assert
    MissionDurationsAssertions.assertErrorResponse(response, 401);
  });

  it('should return 403 when user is not the professional or structure', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create another professional user
    const { data: otherProfessional } =
      await fixture.adminClient.auth.admin.createUser({
        email: `other-professional-${Date.now()}@test.com`,
        email_confirm: true,
        password: 'test-password',
      });

    assertExists(otherProfessional.user);

    const { data: otherProfessionalProfile } = await fixture.adminClient
      .from('profiles')
      .insert({
        email: `other-professional-${Date.now()}@test.com`,
        role: 'professional',
        user_id: otherProfessional.user.id,
      })
      .select('user_id')
      .single();

    assertExists(otherProfessionalProfile);

    const { data: otherProfessionalSession } =
      await fixture.adminClient.auth.signInWithPassword({
        email: `other-professional-${Date.now() - 1}@test.com`,
        password: 'test-password',
      });

    const otherProfessionalToken =
      otherProfessionalSession?.session?.access_token;

    // Act
    const { response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/',
      queryParams: {
        professional_id: fixture.professionalId!,
        structure_id: fixture.structureId!,
      },
      token: otherProfessionalToken || null,
    });

    // Assert
    MissionDurationsAssertions.assertErrorResponse(response, 403);

    // Cleanup
    if (otherProfessional.user) {
      await fixture.adminClient.auth.admin.deleteUser(
        otherProfessional.user.id
      );
    }
  });

  it('should return 400 when professional is not a member of structure', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create another structure
    const { data: otherStructure } =
      await fixture.adminClient.auth.admin.createUser({
        email: `other-structure-${Date.now()}@test.com`,
        email_confirm: true,
        password: 'test-password',
      });

    assertExists(otherStructure.user);

    await fixture.adminClient.from('profiles').insert({
      email: `other-structure-${Date.now()}@test.com`,
      role: 'structure',
      user_id: otherStructure.user.id,
    });

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/',
      queryParams: {
        professional_id: fixture.professionalId!,
        structure_id: otherStructure.user.id,
      },
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertErrorResponse(response, 400);
    assertEquals(data.error?.code, 'PROFESSIONAL_NOT_MEMBER');

    // Cleanup
    if (otherStructure.user) {
      await fixture.adminClient.auth.admin.deleteUser(otherStructure.user.id);
    }
  });
});
