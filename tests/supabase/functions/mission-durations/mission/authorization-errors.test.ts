import '@std/dotenv/load';
import { assertEquals, assertExists } from '@std/assert';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../../helpers/SupabaseTestClient.ts';
import {
  MissionCleanupHelper,
  MissionFixtureBuilder,
  MissionTestFixture,
} from '../../missions/missions.fixture.ts';
import { MissionDurationsAssertions } from '../missionDurations.assertion.ts';

describe('Mission duration authorization errors', () => {
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

    const missionStart = new Date('2025-01-01T00:00:00Z');
    const missionEnd = new Date('2025-12-31T23:59:59Z');

    const { data: mission } = await fixture.adminClient
      .from('missions')
      .insert({
        mission_dtstart: missionStart.toISOString(),
        mission_until: missionEnd.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'accepted',
        structure_id: fixture.structureId!,
        title: 'Test Mission',
      })
      .select('id')
      .single();

    assertExists(mission);

    // Act
    const { response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/mission',
      queryParams: {
        mission_id: mission.id,
      },
      token: null,
    });

    // Assert
    MissionDurationsAssertions.assertErrorResponse(response, 401);

    fixture.missionId = mission.id;
  });

  it('should return 403 when user is not the professional or structure', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    const missionStart = new Date('2025-01-01T00:00:00Z');
    const missionEnd = new Date('2025-12-31T23:59:59Z');

    const { data: mission } = await fixture.adminClient
      .from('missions')
      .insert({
        mission_dtstart: missionStart.toISOString(),
        mission_until: missionEnd.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'accepted',
        structure_id: fixture.structureId!,
        title: 'Test Mission',
      })
      .select('id')
      .single();

    assertExists(mission);

    // Create another professional user
    const otherProfessionalEmail = `other-professional-${Date.now()}@test.com`;
    const { data: otherProfessional } =
      await fixture.adminClient.auth.admin.createUser({
        email: otherProfessionalEmail,
        email_confirm: true,
        password: 'test-password',
      });

    assertExists(otherProfessional.user);

    const { data: otherProfessionalProfile } = await fixture.adminClient
      .from('profiles')
      .insert({
        email: otherProfessionalEmail,
        role: 'professional',
        user_id: otherProfessional.user.id,
      })
      .select('user_id')
      .single();

    assertExists(otherProfessionalProfile);

    // Sign in with the same email used for creation
    const { data: otherProfessionalSession } =
      await fixture.adminClient.auth.signInWithPassword({
        email: otherProfessionalEmail,
        password: 'test-password',
      });

    const otherProfessionalToken =
      otherProfessionalSession?.session?.access_token;

    // Act
    const { response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/mission',
      queryParams: {
        mission_id: mission.id,
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

    fixture.missionId = mission.id;
  });

  it('should return 404 when mission does not exist', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    const nonExistentMissionId = '00000000-0000-0000-0000-000000000000';

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/mission',
      queryParams: {
        mission_id: nonExistentMissionId,
      },
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertErrorResponse(response, 404);
    assertEquals(data.error?.message, 'Mission not found');
  });
});
