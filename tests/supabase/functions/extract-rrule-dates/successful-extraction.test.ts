// deno-lint-ignore-file no-explicit-any

import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { ExtractRruleDatesAssertions } from './extractRruleDates.assertion.ts';
import { ExtractRruleDatesTestData } from './extractRruleDates.data.ts';
import {
  ExtractRruleDatesCleanupHelper,
  ExtractRruleDatesFixtureBuilder,
  ExtractRruleDatesTestFixture,
} from './extractRruleDates.fixture.ts';

describe('Successful extraction', () => {
  let supabaseClient: SupabaseTestClient;
  let apiHelper: ApiTestHelper;
  let fixtureBuilder: ExtractRruleDatesFixtureBuilder;
  let cleanupHelper: ExtractRruleDatesCleanupHelper;
  let fixture: ExtractRruleDatesTestFixture;

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    const adminClient = supabaseClient.createAdminClient();
    apiHelper = new ApiTestHelper(supabaseClient);
    fixtureBuilder = new ExtractRruleDatesFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new ExtractRruleDatesCleanupHelper(adminClient);
  });

  afterEach(async () => {
    if (fixture) {
      await cleanupHelper.cleanupFixture(fixture);
    }
  });

  it('should extract dates from simple RRULE for mission_schedules', async () => {
    // Arrange
    const rruleData = ExtractRruleDatesTestData.validRruleSimple;
    fixture = await fixtureBuilder.createMissionScheduleWithRrule(
      rruleData.rrule
    );

    const body = {
      record_id: fixture.missionScheduleId!,
      table_name: 'mission_schedules' as const,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertSuccessfulExtraction(
      response,
      data,
      rruleData.expectedDtstart,
      rruleData.expectedUntil
    );
    ExtractRruleDatesAssertions.assertContentType(response);

    // Verify the record was updated in the database
    const { data: updatedRecord } = await fixture.adminClient
      .from('mission_schedules')
      .select('dtstart, until')
      .eq('id', fixture.missionScheduleId!)
      .single();

    if (rruleData.expectedDtstart) {
      const expectedDate = new Date(rruleData.expectedDtstart).toISOString();
      const actualDate = updatedRecord?.dtstart
        ? new Date(updatedRecord.dtstart).toISOString()
        : null;
      // Allow for small time differences due to timezone handling
      const expectedTime = new Date(expectedDate).getTime();
      const actualTime = actualDate ? new Date(actualDate).getTime() : 0;
      const timeDiff = Math.abs(expectedTime - actualTime);
      // Allow up to 1 second difference
      if (timeDiff > 1000) {
        throw new Error(
          `Expected dtstart ${expectedDate}, got ${actualDate}, diff: ${timeDiff}ms`
        );
      }
    } else {
      // dtstart should be null
    }

    if (rruleData.expectedUntil) {
      const expectedDate = new Date(rruleData.expectedUntil).toISOString();
      const actualDate = updatedRecord?.until
        ? new Date(updatedRecord.until).toISOString()
        : null;
      const expectedTime = new Date(expectedDate).getTime();
      const actualTime = actualDate ? new Date(actualDate).getTime() : 0;
      const timeDiff = Math.abs(expectedTime - actualTime);
      if (timeDiff > 1000) {
        throw new Error(
          `Expected until ${expectedDate}, got ${actualDate}, diff: ${timeDiff}ms`
        );
      }
    }
  });

  it('should extract dates from RRULE with UNTIL for mission_schedules', async () => {
    // Arrange
    const rruleData = ExtractRruleDatesTestData.validRruleWithUntil;
    fixture = await fixtureBuilder.createMissionScheduleWithRrule(
      rruleData.rrule
    );

    const body = {
      record_id: fixture.missionScheduleId!,
      table_name: 'mission_schedules' as const,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertSuccessfulExtraction(
      response,
      data,
      rruleData.expectedDtstart,
      rruleData.expectedUntil
    );
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should extract dates from RRULE with EXDATE for mission_schedules', async () => {
    // Arrange
    const rruleData = ExtractRruleDatesTestData.validRruleWithExdate;
    fixture = await fixtureBuilder.createMissionScheduleWithRrule(
      rruleData.rrule
    );

    const body = {
      record_id: fixture.missionScheduleId!,
      table_name: 'mission_schedules' as const,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertSuccessfulExtraction(
      response,
      data,
      rruleData.expectedDtstart,
      rruleData.expectedUntil
    );
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should extract dates from simple RRULE for availabilities', async () => {
    // Arrange
    const rruleData = ExtractRruleDatesTestData.validRruleSimple;
    fixture = await fixtureBuilder.createAvailabilityWithRrule(rruleData.rrule);

    const body = {
      record_id: fixture.availabilityId!,
      table_name: 'availabilities' as const,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertSuccessfulExtraction(
      response,
      data,
      rruleData.expectedDtstart,
      rruleData.expectedUntil
    );
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should extract dates from RRULE with UNTIL for availabilities', async () => {
    // Arrange
    const rruleData = ExtractRruleDatesTestData.validRruleWithUntil;
    fixture = await fixtureBuilder.createAvailabilityWithRrule(rruleData.rrule);

    const body = {
      record_id: fixture.availabilityId!,
      table_name: 'availabilities' as const,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertSuccessfulExtraction(
      response,
      data,
      rruleData.expectedDtstart,
      rruleData.expectedUntil
    );
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should extract dates from daily RRULE', async () => {
    // Arrange
    const rruleData = ExtractRruleDatesTestData.validRruleDaily;
    fixture = await fixtureBuilder.createMissionScheduleWithRrule(
      rruleData.rrule
    );

    const body = {
      record_id: fixture.missionScheduleId!,
      table_name: 'mission_schedules' as const,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertSuccessfulExtraction(
      response,
      data,
      rruleData.expectedDtstart,
      rruleData.expectedUntil
    );
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should extract dates from monthly RRULE', async () => {
    // Arrange
    const rruleData = ExtractRruleDatesTestData.validRruleMonthly;
    fixture = await fixtureBuilder.createMissionScheduleWithRrule(
      rruleData.rrule
    );

    const body = {
      record_id: fixture.missionScheduleId!,
      table_name: 'mission_schedules' as const,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertSuccessfulExtraction(
      response,
      data,
      rruleData.expectedDtstart,
      rruleData.expectedUntil
    );
    ExtractRruleDatesAssertions.assertContentType(response);
  });
});
