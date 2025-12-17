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
import { MissionDurationsTestData } from '../missionDurations.data.ts';

describe('Successful mission duration retrieval', () => {
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

  it('should return zero durations when mission has no schedules', async () => {
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
      path: '/mission',
      queryParams: {
        mission_id: mission.id,
      },
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertSuccessfulResponse(response, data);
    MissionDurationsAssertions.assertContentType(response);
    assertEquals(data.total_duration_mn, 0);
    assertEquals(data.past_duration_mn, 0);
    assertEquals(data.future_duration_mn, 0);
    assertEquals(data.percentage, 0);

    fixture.missionId = mission.id;
  });

  it('should calculate durations for a mission with one schedule', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    const missionStart = new Date('2025-01-01T00:00:00Z');
    const missionEnd = new Date('2025-12-31T23:59:59Z');
    const now = new Date('2025-06-15T12:00:00Z'); // Middle of the year

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

    // Create a weekly schedule (every Monday, 120 minutes)
    await fixture.adminClient.from('mission_schedules').insert({
      duration_mn: 120,
      mission_id: mission.id,
      rrule: MissionDurationsTestData.weeklyRRULE,
    });

    // Mock current time for consistent testing
    const originalDate = Date;
    global.Date = class extends originalDate {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(now);
        } else {
          super(...(args as ConstructorParameters<typeof originalDate>));
        }
      }
    } as typeof Date;

    try {
      // Act
      const { data, response } = await apiHelper.invokeEndpoint({
        method: 'GET',
        name: 'mission-durations',
        path: '/mission',
        queryParams: {
          mission_id: mission.id,
        },
        token: fixture.professionalToken!,
      });

      // Assert
      MissionDurationsAssertions.assertSuccessfulResponse(response, data);
      MissionDurationsAssertions.assertContentType(response);
      // Should have some total duration (approximately 52 weeks * 120 minutes)
      assertEquals(data.total_duration_mn > 0, true);
      // Past and future should sum to total
      assertEquals(
        data.total_duration_mn,
        data.past_duration_mn + data.future_duration_mn
      );
      // Percentage should be calculated correctly
      assertEquals(data.percentage >= 0, true);
      assertEquals(data.percentage <= 100, true);
      const expectedPercentage =
        (data.past_duration_mn / data.total_duration_mn) * 100;
      assertEquals(
        Math.abs(data.percentage - expectedPercentage) < 0.01,
        true,
        `Percentage should be ~${expectedPercentage}%, got ${data.percentage}%`
      );
    } finally {
      global.Date = originalDate;
    }

    fixture.missionId = mission.id;
  });

  it('should return zero durations for declined mission', async () => {
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
        status: 'declined',
        structure_id: fixture.structureId!,
        title: 'Declined Mission',
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
      path: '/mission',
      queryParams: {
        mission_id: mission.id,
      },
      token: fixture.professionalToken!,
    });

    // Assert
    MissionDurationsAssertions.assertSuccessfulResponse(response, data);
    // Declined missions should return zero durations
    assertEquals(data.total_duration_mn, 0);
    assertEquals(data.past_duration_mn, 0);
    assertEquals(data.future_duration_mn, 0);
    assertEquals(data.percentage, 0);

    fixture.missionId = mission.id;
  });

  it('should return zero durations for cancelled mission', async () => {
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
        status: 'cancelled',
        structure_id: fixture.structureId!,
        title: 'Cancelled Mission',
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
      path: '/mission',
      queryParams: {
        mission_id: mission.id,
      },
      token: fixture.structureToken!,
    });

    // Assert
    MissionDurationsAssertions.assertSuccessfulResponse(response, data);
    // Cancelled missions should return zero durations
    assertEquals(data.total_duration_mn, 0);
    assertEquals(data.past_duration_mn, 0);
    assertEquals(data.future_duration_mn, 0);
    assertEquals(data.percentage, 0);

    fixture.missionId = mission.id;
  });

  it('should allow structure to query mission duration', async () => {
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

    await fixture.adminClient.from('mission_schedules').insert({
      duration_mn: 120,
      mission_id: mission.id,
      rrule: MissionDurationsTestData.weeklyRRULE,
    });

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/mission',
      queryParams: {
        mission_id: mission.id,
      },
      token: fixture.structureToken!,
    });

    // Assert
    MissionDurationsAssertions.assertSuccessfulResponse(response, data);
    MissionDurationsAssertions.assertContentType(response);
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
      path: '/mission',
      queryParams: {
        mission_id: mission.id,
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
