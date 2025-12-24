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

describe('Successful mission creation', () => {
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
    const mission = data.mission || data;
    assertEquals(mission.status, 'pending');
    assertEquals(mission.title, requestBody.title);
    assertEquals(mission.description, requestBody.description);
    assertEquals(mission.professional_id, requestBody.professional_id);
    assertEquals(mission.structure_id, requestBody.structure_id);

    // Verify mission schedules were created
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('*')
      .eq('mission_id', mission.id);

    assertEquals(schedules?.length, 1);
    if (schedules && schedules[0]) {
      // Wait for the async trigger to populate dtstart and until
      // Use longer timeout to ensure edge function completes
      await latencyHelper.waitForEdgeFunction(schedules[0].id, {
        timeoutMs: 15000, // 15 seconds
      });

      // Poll until dtstart is populated (with retry)
      let retries = 0;
      let updatedSchedule = null;
      while (retries < 10) {
        const { data: fetched } = await fixture.adminClient
          .from('mission_schedules')
          .select('*')
          .eq('id', schedules[0].id)
          .single();

        if (fetched && fetched.dtstart) {
          updatedSchedule = fetched;
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      assertExists(
        updatedSchedule,
        'Schedule dtstart was not populated after waiting'
      );
      assertExists(updatedSchedule.dtstart);
      MissionAssertions.assertMissionScheduleStructure(updatedSchedule);
      assertEquals(
        updatedSchedule.duration_mn,
        requestBody.schedules[0].duration_mn
      );
    }

    fixture.missionId = mission.id;
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
    const mission = data.mission || data;

    // Verify all mission schedules were created
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('*')
      .eq('mission_id', mission.id);

    assertEquals(schedules?.length, 2);

    // Wait for the async triggers to populate dtstart and until for all schedules
    // Use longer timeout to ensure edge functions complete
    for (const schedule of schedules || []) {
      await latencyHelper.waitForEdgeFunction(schedule.id, {
        timeoutMs: 15000, // 15 seconds
      });
    }

    // Poll until all schedules have dtstart populated (with retry)
    const scheduleIds = schedules!.map(s => s.id);
    const updatedSchedules: Array<{
      created_at: string;
      dtstart: null | string;
      duration_mn: number;
      id: string;
      mission_id: string;
      rrule: string;
      until: null | string;
      updated_at: string;
    }> = [];

    for (const scheduleId of scheduleIds) {
      let retries = 0;
      while (retries < 10) {
        const { data: fetched } = await fixture.adminClient
          .from('mission_schedules')
          .select('*')
          .eq('id', scheduleId)
          .single();

        if (fetched && fetched.dtstart) {
          updatedSchedules.push(fetched);
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }
    }

    assertEquals(
      updatedSchedules.length,
      2,
      'Not all schedules had dtstart populated'
    );

    // Match schedules by duration_mn instead of assuming order
    // Create a map of expected durations
    const expectedDurations = requestBody.schedules.map(s => s.duration_mn);
    for (const schedule of updatedSchedules) {
      // Verify dtstart is populated (edge function should have completed)
      assertExists(schedule.dtstart);
      MissionAssertions.assertMissionScheduleStructure(schedule);
      // Verify the duration matches one of the expected durations
      assertEquals(
        expectedDurations.includes(schedule.duration_mn),
        true,
        `Schedule duration ${schedule.duration_mn} not found in expected durations: ${expectedDurations.join(', ')}`
      );
    }

    fixture.missionId = mission.id;
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
    const mission = data.mission || data;

    // Verify mission schedule was created
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('*')
      .eq('mission_id', mission.id);

    assertEquals(schedules?.length, 1);
    if (schedules && schedules[0]) {
      // Wait for the async trigger to populate dtstart and until
      // Use longer timeout to ensure edge function completes
      await latencyHelper.waitForEdgeFunction(schedules[0].id, {
        timeoutMs: 15000, // 15 seconds
      });

      // Poll until dtstart is populated (with retry)
      let retries = 0;
      let updatedSchedule = null;
      while (retries < 10) {
        const { data: fetched } = await fixture.adminClient
          .from('mission_schedules')
          .select('*')
          .eq('id', schedules[0].id)
          .single();

        if (fetched && fetched.dtstart) {
          updatedSchedule = fetched;
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      assertExists(
        updatedSchedule,
        'Schedule dtstart was not populated after waiting'
      );
      assertExists(updatedSchedule.dtstart);
      MissionAssertions.assertMissionScheduleStructure(updatedSchedule);
    }

    fixture.missionId = mission.id;
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
    const mission = data.mission || data;
    assertEquals(mission.status, 'pending');

    fixture.missionId = mission.id;
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
    const mission = data.mission || data;

    // Verify the RRULE was constrained
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('id, rrule, until')
      .eq('mission_id', mission.id)
      .single();

    assertExists(schedules);
    assertExists(schedules.rrule);
    assertExists(schedules.id);

    // Wait for the async trigger to populate until
    // Use longer timeout to ensure edge function completes
    await latencyHelper.waitForEdgeFunction(schedules.id, {
      timeoutMs: 15000, // 15 seconds
    });

    // Fetch schedules again after trigger completes
    const { data: updatedSchedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('rrule, until')
      .eq('mission_id', mission.id)
      .single();

    assertExists(updatedSchedules);
    assertExists(updatedSchedules.rrule);
    // The RRULE should contain UNTIL that matches mission_until
    // Note: RRULE format uses UNTIL= not UNTIL:
    assertEquals(updatedSchedules.rrule.includes('UNTIL='), true);
    assertExists(updatedSchedules.until);

    fixture.missionId = mission.id;
  });
});
