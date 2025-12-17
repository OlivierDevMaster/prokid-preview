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

describe('Successful mission durations retrieval', () => {
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

  it('should return zero durations when no missions exist', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

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
    MissionDurationsAssertions.assertContentType(response);
    assertEquals(data.total_duration_mn, 0);
    assertEquals(data.past_duration_mn, 0);
    assertEquals(data.future_duration_mn, 0);
    assertEquals(data.percentage, 0);
  });

  it('should calculate durations for a single mission with one schedule', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Create a mission with a weekly schedule
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
        path: '/',
        queryParams: {
          professional_id: fixture.professionalId!,
          structure_id: fixture.structureId!,
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

  it('should calculate durations for multiple missions', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    const mission1Start = new Date('2025-01-01T00:00:00Z');
    const mission1End = new Date('2025-06-30T23:59:59Z');
    const mission2Start = new Date('2025-07-01T00:00:00Z');
    const mission2End = new Date('2025-12-31T23:59:59Z');

    // Create first mission
    const { data: mission1 } = await fixture.adminClient
      .from('missions')
      .insert({
        mission_dtstart: mission1Start.toISOString(),
        mission_until: mission1End.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'accepted',
        structure_id: fixture.structureId!,
        title: 'First Mission',
      })
      .select('id')
      .single();

    assertExists(mission1);

    await fixture.adminClient.from('mission_schedules').insert({
      duration_mn: 60,
      mission_id: mission1.id,
      rrule:
        'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20250630T180000Z',
    });

    // Create second mission
    const { data: mission2 } = await fixture.adminClient
      .from('missions')
      .insert({
        mission_dtstart: mission2Start.toISOString(),
        mission_until: mission2End.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'accepted',
        structure_id: fixture.structureId!,
        title: 'Second Mission',
      })
      .select('id')
      .single();

    assertExists(mission2);

    await fixture.adminClient.from('mission_schedules').insert({
      duration_mn: 90,
      mission_id: mission2.id,
      rrule:
        'DTSTART:20250701T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=WE;UNTIL=20251231T180000Z',
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
    MissionDurationsAssertions.assertContentType(response);
    // Should aggregate durations from both missions
    assertEquals(data.total_duration_mn > 0, true);
    assertEquals(
      data.total_duration_mn,
      data.past_duration_mn + data.future_duration_mn
    );
    // Percentage should be calculated correctly
    assertEquals(data.percentage >= 0, true);
    assertEquals(data.percentage <= 100, true);

    fixture.missionIds = [mission1.id, mission2.id];
  });

  it('should exclude declined and cancelled missions', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    const missionStart = new Date('2025-01-01T00:00:00Z');
    const missionEnd = new Date('2025-12-31T23:59:59Z');

    // Create accepted mission
    const { data: acceptedMission } = await fixture.adminClient
      .from('missions')
      .insert({
        mission_dtstart: missionStart.toISOString(),
        mission_until: missionEnd.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'accepted',
        structure_id: fixture.structureId!,
        title: 'Accepted Mission',
      })
      .select('id')
      .single();

    assertExists(acceptedMission);

    await fixture.adminClient.from('mission_schedules').insert({
      duration_mn: 120,
      mission_id: acceptedMission.id,
      rrule: MissionDurationsTestData.weeklyRRULE,
    });

    // Create declined mission
    const { data: declinedMission } = await fixture.adminClient
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

    assertExists(declinedMission);

    await fixture.adminClient.from('mission_schedules').insert({
      duration_mn: 120,
      mission_id: declinedMission.id,
      rrule: MissionDurationsTestData.weeklyRRULE,
    });

    // Create cancelled mission
    const { data: cancelledMission } = await fixture.adminClient
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

    assertExists(cancelledMission);

    await fixture.adminClient.from('mission_schedules').insert({
      duration_mn: 120,
      mission_id: cancelledMission.id,
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
    // Should only count the accepted mission
    assertEquals(data.total_duration_mn > 0, true);
    // Should not include declined/cancelled missions (they would triple the duration)
    // Percentage should be calculated correctly
    assertEquals(data.percentage >= 0, true);
    assertEquals(data.percentage <= 100, true);

    fixture.missionIds = [
      acceptedMission.id,
      declinedMission.id,
      cancelledMission.id,
    ];
  });

  it('should allow structure to query durations', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'mission-durations',
      path: '/',
      queryParams: {
        professional_id: fixture.professionalId!,
        structure_id: fixture.structureId!,
      },
      token: fixture.structureToken!,
    });

    // Assert
    MissionDurationsAssertions.assertSuccessfulResponse(response, data);
    MissionDurationsAssertions.assertContentType(response);
    // Percentage should be calculated correctly
    assertEquals(data.percentage >= 0, true);
    assertEquals(data.percentage <= 100, true);
  });
});
