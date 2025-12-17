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
import { MissionDurationsTestData } from './missionDurations.data.ts';

describe('Mission durations edge cases', () => {
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

  it('should handle mission with no schedules', async () => {
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
        title: 'Mission Without Schedules',
      })
      .select('id')
      .single();

    assertExists(mission);

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/',
      queryParams: {
        professional_id: fixture.professionalId!,
        structure_id: fixture.structureId!,
      },
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertSuccessfulResponse(response, data);
    assertEquals(data.total_duration_mn, 0);
    assertEquals(data.past_duration_mn, 0);
    assertEquals(data.future_duration_mn, 0);
    assertEquals(data.percentage, 0);

    fixture.missionId = mission.id;
  });

  it('should handle mission with multiple schedules', async () => {
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
        title: 'Mission With Multiple Schedules',
      })
      .select('id')
      .single();

    assertExists(mission);

    // Create multiple schedules
    await fixture.adminClient.from('mission_schedules').insert([
      {
        duration_mn: 60,
        mission_id: mission.id,
        rrule:
          'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20251231T180000Z',
      },
      {
        duration_mn: 90,
        mission_id: mission.id,
        rrule:
          'DTSTART:20250101T140000Z\nRRULE:FREQ=WEEKLY;BYDAY=WE;UNTIL=20251231T180000Z',
      },
    ]);

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/',
      queryParams: {
        professional_id: fixture.professionalId!,
        structure_id: fixture.structureId!,
      },
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertSuccessfulResponse(response, data);
    // Should aggregate durations from both schedules
    assertEquals(data.total_duration_mn > 0, true);
    assertEquals(
      data.total_duration_mn,
      data.past_duration_mn + data.future_duration_mn
    );
    // Percentage should be calculated correctly
    assertEquals(data.percentage >= 0, true);
    assertEquals(data.percentage <= 100, true);

    fixture.missionId = mission.id;
  });

  it('should handle RRULE with COUNT instead of UNTIL', async () => {
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
        title: 'Mission With COUNT',
      })
      .select('id')
      .single();

    assertExists(mission);

    // Create schedule with COUNT
    await fixture.adminClient.from('mission_schedules').insert({
      duration_mn: 120,
      mission_id: mission.id,
      rrule: MissionDurationsTestData.dailyRRULE, // Uses COUNT=10
    });

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/',
      queryParams: {
        professional_id: fixture.professionalId!,
        structure_id: fixture.structureId!,
      },
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertSuccessfulResponse(response, data);
    // Should calculate based on COUNT occurrences
    assertEquals(data.total_duration_mn, 10 * 120); // 10 occurrences * 120 minutes
    // Percentage should be calculated correctly
    assertEquals(data.percentage >= 0, true);
    assertEquals(data.percentage <= 100, true);

    fixture.missionId = mission.id;
  });

  it('should handle RRULE with EXDATE', async () => {
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
        title: 'Mission With EXDATE',
      })
      .select('id')
      .single();

    assertExists(mission);

    // Create schedule with EXDATE
    await fixture.adminClient.from('mission_schedules').insert({
      duration_mn: 120,
      mission_id: mission.id,
      rrule: MissionDurationsTestData.rruleWithEXDATE,
    });

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/',
      queryParams: {
        professional_id: fixture.professionalId!,
        structure_id: fixture.structureId!,
      },
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertSuccessfulResponse(response, data);
    // EXDATE should exclude that occurrence from calculations
    assertEquals(data.total_duration_mn > 0, true);
    assertEquals(
      data.total_duration_mn,
      data.past_duration_mn + data.future_duration_mn
    );
    // Percentage should be calculated correctly
    assertEquals(data.percentage >= 0, true);
    assertEquals(data.percentage <= 100, true);

    fixture.missionId = mission.id;
  });

  it('should handle pending missions', async () => {
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
        status: 'pending',
        structure_id: fixture.structureId!,
        title: 'Pending Mission',
      })
      .select('id')
      .single();

    assertExists(mission);

    await fixture.adminClient.from('mission_schedules').insert({
      duration_mn: 120,
      mission_id: mission.id,
      rrule: MissionDurationsTestData.weeklyRRULE,
    });

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/',
      queryParams: {
        professional_id: fixture.professionalId!,
        structure_id: fixture.structureId!,
      },
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertSuccessfulResponse(response, data);
    // Pending missions should be included
    assertEquals(data.total_duration_mn > 0, true);
    // Percentage should be calculated correctly
    assertEquals(data.percentage >= 0, true);
    assertEquals(data.percentage <= 100, true);

    fixture.missionId = mission.id;
  });
});
