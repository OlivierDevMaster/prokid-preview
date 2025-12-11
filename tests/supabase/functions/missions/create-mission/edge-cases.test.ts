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

describe('Mission creation edge cases', () => {
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

  it('should create mission with RRULE containing EXDATE', async () => {
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
          rrule:
            'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO\nEXDATE:20250608T090000Z',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Mission with EXDATE',
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

    // Verify EXDATE is preserved in schedule
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('rrule')
      .eq('mission_id', data.id)
      .single();

    assertExists(schedules);
    assertEquals(schedules.rrule.includes('EXDATE:'), true);

    fixture.missionId = data.id;
  });

  it('should create mission with multiple schedules on different days', async () => {
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
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
        },
        {
          duration_mn: 180,
          rrule: 'DTSTART:20250601T140000Z\nRRULE:FREQ=WEEKLY;BYDAY=WE',
        },
        {
          duration_mn: 240,
          rrule: 'DTSTART:20250601T100000Z\nRRULE:FREQ=WEEKLY;BYDAY=FR',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Multi-Day Mission',
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

    // Verify all schedules were created
    const { data: schedules } = await fixture.adminClient
      .from('mission_schedules')
      .select('*')
      .eq('mission_id', data.id);

    assertEquals(schedules?.length, 3);
    schedules?.forEach(schedule => {
      MissionAssertions.assertMissionScheduleStructure(schedule);
    });

    fixture.missionId = data.id;
  });

  it('should create mission with very long title', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const longTitle = 'A'.repeat(500);
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      professional_id: fixture.professionalId!,
      structure_id: fixture.structureId!,
      title: longTitle,
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
    assertEquals(data.title, longTitle);

    fixture.missionId = data.id;
  });

  it('should create mission with very long description', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const longDescription = 'B'.repeat(2000);
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      description: longDescription,
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
    assertEquals(data.description, longDescription);

    fixture.missionId = data.id;
  });

  it('should create mission with minimal date range (same day)', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T09:00:00Z',
      mission_until: '2025-06-01T11:00:00Z', // Same day, 2 hours later
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY;COUNT=1',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Same Day Mission',
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

    fixture.missionId = data.id;
  });

  it('should create mission with very long date range', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-01-01T09:00:00Z',
      mission_until: '2030-12-31T18:00:00Z', // 6 years
      professional_id: fixture.professionalId!,
      structure_id: fixture.structureId!,
      title: 'Long Term Mission',
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

    fixture.missionId = data.id;
  });

  it('should create mission with daily frequency RRULE', async () => {
    // Arrange
    fixture = await fixtureBuilder.createStructureWithProfessionalMember();
    const requestBody = {
      ...MissionTestData.validMissionRequest,
      mission_dtstart: '2025-06-01T09:00:00Z',
      mission_until: '2025-06-30T18:00:00Z',
      professional_id: fixture.professionalId!,
      schedules: [
        {
          duration_mn: 120,
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Daily Mission',
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

    fixture.missionId = data.id;
  });

  it('should create mission with multiple BYDAY values', async () => {
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
          rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR',
        },
      ],
      structure_id: fixture.structureId!,
      title: 'Multi-Day Weekly Mission',
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

    fixture.missionId = data.id;
  });

  it('should create mission without description', async () => {
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
    assertEquals(data.description, null);

    fixture.missionId = data.id;
  });
});
