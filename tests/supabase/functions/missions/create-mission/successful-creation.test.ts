// deno-lint-ignore-file no-explicit-any

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

describe('Successful mission creation', () => {
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

  it('should create a mission with a single schedule', async () => {
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
    MissionAssertions.assertContentType(response);
    assertEquals(data.status, 'pending');
    assertEquals(data.title, requestBody.title);
    assertEquals(data.description, requestBody.description);
    assertEquals(data.professional_id, requestBody.professional_id);
    assertEquals(data.structure_id, requestBody.structure_id);

    // Verify mission schedules were created
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('*')
      .eq('mission_id', data.id);

    assertEquals(schedules?.length, 1);
    if (schedules && schedules[0]) {
      MissionAssertions.assertMissionScheduleStructure(schedules[0]);
      assertEquals(
        schedules[0].duration_mn,
        requestBody.schedules[0].duration_mn
      );
    }

    fixture.missionId = data.id;
  });

  it('should create a mission with multiple schedules', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequestMultipleSchedules,
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
    MissionAssertions.assertContentType(response);

    // Verify all mission schedules were created
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('*')
      .eq('mission_id', data.id);

    assertEquals(schedules?.length, 2);
    schedules?.forEach((schedule, index) => {
      MissionAssertions.assertMissionScheduleStructure(schedule);
      assertEquals(
        schedule.duration_mn,
        requestBody.schedules[index].duration_mn
      );
    });

    fixture.missionId = data.id;
  });

  it('should create a one-time mission', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequestOneTime,
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
    MissionAssertions.assertContentType(response);

    // Verify mission schedule was created
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('*')
      .eq('mission_id', data.id);

    assertEquals(schedules?.length, 1);
    if (schedules && schedules[0]) {
      MissionAssertions.assertMissionScheduleStructure(schedules[0]);
    }

    fixture.missionId = data.id;
  });

  it('should create a mission with custom status', async () => {
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
    assertEquals(data.status, 'pending');

    fixture.missionId = data.id;
  });

  it('should constrain RRULEs by mission dates', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T09:00:00Z',
      mission_until: '2025-12-31T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          // RRULE without UNTIL - should be constrained by mission_until
          rrule: 'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Constrained Mission',
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

    // Verify the RRULE was constrained
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('rrule, until')
      .eq('mission_id', data.id)
      .single();

    assertExists(schedules);
    assertExists(schedules.rrule);
    // The RRULE should contain UNTIL that matches mission_until
    assertEquals(schedules.rrule.includes('UNTIL:'), true);
    assertExists(schedules.until);

    fixture.missionId = data.id;
  });
});
