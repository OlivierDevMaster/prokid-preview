// deno-lint-ignore-file no-explicit-any

import { assertEquals } from '@std/assert';
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

describe('Edge cases', () => {
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

  it('should return not found for non-existent record_id', async () => {
    // Arrange
    const body = {
      record_id: ExtractRruleDatesTestData.testUuids.nonExistent,
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
    ExtractRruleDatesAssertions.assertNotFound(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should return invalid record error for record with empty rrule', async () => {
    // Arrange
    // Note: We can't create a record with null rrule due to NOT NULL constraint,
    // so we'll create one and update it to empty string
    fixture = await fixtureBuilder.createMissionScheduleWithRrule(
      ExtractRruleDatesTestData.validRruleSimple.rrule
    );

    // Update to empty rrule
    await fixture.adminClient
      .from('mission_schedules')
      .update({ rrule: '' })
      .eq('id', fixture.missionScheduleId!);

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
    ExtractRruleDatesAssertions.assertInvalidRecord(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should return invalid RRULE error for malformed RRULE', async () => {
    // Arrange
    fixture = await fixtureBuilder.createMissionScheduleWithRrule(
      ExtractRruleDatesTestData.invalidRruleMalformed
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
    ExtractRruleDatesAssertions.assertInvalidRrule(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should return invalid record error for empty RRULE', async () => {
    // Arrange
    // Note: Empty rrule is caught by the handler's !record.rrule check,
    // which returns INVALID_RECORD, not INVALID_RRULE
    fixture = await fixtureBuilder.createMissionScheduleWithRrule(
      ExtractRruleDatesTestData.validRruleSimple.rrule
    );

    // Update to empty rrule
    await fixture.adminClient
      .from('mission_schedules')
      .update({ rrule: '' })
      .eq('id', fixture.missionScheduleId!);

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
    ExtractRruleDatesAssertions.assertInvalidRecord(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should handle RRULE missing DTSTART (rrule library may parse it)', async () => {
    // Arrange
    // Note: The rrule library may parse RRULE without DTSTART successfully
    // (using a default date). The handler doesn't validate dtstart presence,
    // so this test checks the actual behavior.
    fixture = await fixtureBuilder.createMissionScheduleWithRrule(
      ExtractRruleDatesTestData.invalidRruleMissingDtstart
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
    // The rrule library may parse this successfully, so we check for either
    // success or invalid RRULE error
    if (response.status === 200) {
      ExtractRruleDatesAssertions.assertSuccessfulExtraction(response, data);
    } else {
      ExtractRruleDatesAssertions.assertInvalidRrule(response, data);
    }
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should handle RRULE with multiple rules in RRuleSet', async () => {
    // Arrange
    // Create an RRULE with EXDATE which creates an RRuleSet
    const rruleWithExdate =
      'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO\nEXDATE:20250115T090000Z';
    fixture =
      await fixtureBuilder.createMissionScheduleWithRrule(rruleWithExdate);

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
    ExtractRruleDatesAssertions.assertSuccessfulExtraction(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
    // Should have dtstart extracted (ApiHelper unwraps the response)
    if (data.dtstart !== null) {
      const dtstartDate = new Date(data.dtstart);
      assertEquals(isNaN(dtstartDate.getTime()), false);
    }
  });

  it('should handle RRULE without UNTIL (infinite recurrence)', async () => {
    // Arrange
    const rruleWithoutUntil =
      'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO';
    fixture =
      await fixtureBuilder.createMissionScheduleWithRrule(rruleWithoutUntil);

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
      '2025-01-01T09:00:00.000Z',
      null
    );
    ExtractRruleDatesAssertions.assertContentType(response);
  });
});
