import '@std/dotenv/load';
import { assertEquals } from '@std/assert';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../../helpers/SupabaseTestClient.ts';
import {
  MissionCleanupHelper,
  MissionFixtureBuilder,
  MissionTestFixture,
} from '../../missions/missions.fixture.ts';
import { MissionDurationsAssertions } from '../missionDurations.assertion.ts';

describe('Mission duration validation errors', () => {
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

  it('should return 400 when mission_id is missing', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/mission',
      queryParams: {},
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertErrorResponse(response, 400);
    assertEquals(data.error?.code, 'MISSING_PARAMETERS');
    assertEquals(data.error?.message, 'mission_id is required');
  });

  it('should return 400 when mission_id is empty string', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/mission',
      queryParams: {
        mission_id: '',
      },
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertErrorResponse(response, 400);
    assertEquals(data.error?.code, 'MISSING_PARAMETERS');
  });
});
