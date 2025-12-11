import '@std/dotenv/load';
import { assertEquals, assertExists } from '@std/assert';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../../helpers/SupabaseTestClient.ts';
import { MissionAssertions } from '../missions.assertion.ts';
import { MissionTestData } from '../missions.data.ts';
import {
  MissionCleanupHelper,
  MissionEdgeFunctionLatencyHelper,
  MissionFixtureBuilder,
  MissionTestFixture,
} from '../missions.fixture.ts';

describe('Mission creation response format validation', () => {
  let supabaseClient: SupabaseTestClient;
  let apiHelper: ApiTestHelper;
  let fixtureBuilder: MissionFixtureBuilder;
  let cleanupHelper: MissionCleanupHelper;
  let latencyHelper: MissionEdgeFunctionLatencyHelper;
  let fixture: MissionTestFixture | null = null;

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    const adminClient = supabaseClient.createAdminClient();
    apiHelper = new ApiTestHelper(supabaseClient);
    fixtureBuilder = new MissionFixtureBuilder(adminClient, supabaseClient);
    cleanupHelper = new MissionCleanupHelper(adminClient);
    latencyHelper = new MissionEdgeFunctionLatencyHelper(adminClient);
  });

  afterEach(async () => {
    if (fixture) {
      await cleanupHelper.cleanupFixture(fixture);
      fixture = null;
    }
  });

  it('should return valid JSON response structure', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      structure_id: fixture.structureId!,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertResponseStructure(data);
    MissionAssertions.assertContentType(response);
    const mission = data.mission || data;
    MissionAssertions.assertMissionStructure(mission);

    fixture.missionId = mission.id;
  });

  it('should return mission with all required fields', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      structure_id: fixture.structureId!,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulCreation(response, data);
    const mission = data.mission || data;
    assertEquals(typeof mission.id, 'string');
    assertEquals(typeof mission.title, 'string');
    assertEquals(typeof mission.structure_id, 'string');
    assertEquals(typeof mission.professional_id, 'string');
    assertEquals(typeof mission.status, 'string');
    assertEquals(typeof mission.mission_dtstart, 'string');
    assertEquals(typeof mission.mission_until, 'string');
    assertEquals(typeof mission.created_at, 'string');
    assertEquals(typeof mission.updated_at, 'string');

    fixture.missionId = mission.id;
  });

  it('should return mission with correct date formats (ISO 8601)', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      structure_id: fixture.structureId!,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulCreation(response, data);
    const mission = data.mission || data;

    // Verify dates are valid ISO 8601 strings
    const missionDtstart = new Date(mission.mission_dtstart);
    const missionUntil = new Date(mission.mission_until);
    const createdAt = new Date(mission.created_at);
    const updatedAt = new Date(mission.updated_at);

    assertEquals(isNaN(missionDtstart.getTime()), false);
    assertEquals(isNaN(missionUntil.getTime()), false);
    assertEquals(isNaN(createdAt.getTime()), false);
    assertEquals(isNaN(updatedAt.getTime()), false);

    // Verify mission_until is after mission_dtstart
    assertEquals(missionUntil > missionDtstart, true);

    fixture.missionId = mission.id;
  });

  it('should return mission schedules with correct structure', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      structure_id: fixture.structureId!,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulCreation(response, data);
    const mission = data.mission || data;

    // Fetch schedules separately to verify structure
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('*')
      .eq('mission_id', mission.id);

    assertExists(schedules);
    assertEquals(schedules.length, 1);

    // Wait for the async trigger to populate dtstart and until
    const scheduleId = schedules[0].id;
    await latencyHelper.waitForEdgeFunction(scheduleId);

    // Fetch schedules again after trigger completes
    const { data: updatedSchedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('*')
      .eq('mission_id', mission.id);

    assertExists(updatedSchedules);
    assertEquals(updatedSchedules.length, 1);

    updatedSchedules.forEach(schedule => {
      MissionAssertions.assertMissionScheduleStructure(schedule);
      assertEquals(schedule.mission_id, mission.id);
    });

    fixture.missionId = mission.id;
  });

  it('should return mission with correct status enum value', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      status: 'pending',
      structure_id: fixture.structureId!,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulCreation(response, data);
    const mission = data.mission || data;
    assertEquals(
      ['accepted', 'cancelled', 'declined', 'pending'].includes(mission.status),
      true
    );

    fixture.missionId = mission.id;
  });

  it('should return mission with UUIDs in correct format', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      structure_id: fixture.structureId!,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulCreation(response, data);
    const mission = data.mission || data;

    // Verify UUID format (basic check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    assertEquals(uuidRegex.test(mission.id), true);
    assertEquals(uuidRegex.test(mission.structure_id), true);
    assertEquals(uuidRegex.test(mission.professional_id), true);

    fixture.missionId = mission.id;
  });

  it('should return mission with description when provided', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      description: 'Test description',
      professional_id: fixture.professionalId!,
      structure_id: fixture.structureId!,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulCreation(response, data);
    const mission = data.mission || data;
    assertEquals(mission.description, requestBody.description);
    assertEquals(typeof mission.description, 'string');

    fixture.missionId = mission.id;
  });

  it('should return mission with null description when not provided', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
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
      title: 'Mission Without Description',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'missions',
      path: '/',
      token: fixture.structureToken!,
    });

    // Assert
    MissionAssertions.assertSuccessfulCreation(response, data);
    const mission = data.mission || data;
    assertEquals(mission.description, null);

    fixture.missionId = mission.id;
  });
});
