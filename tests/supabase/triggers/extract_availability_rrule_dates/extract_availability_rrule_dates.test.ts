import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './extract_availability_rrule_dates.data.ts';
import {
  EdgeFunctionLatencyHelper,
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './extract_availability_rrule_dates.fixture.ts';

describe('Trigger: extract_availability_rrule_dates', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: TriggerTestFixtureBuilder;
  let cleanupHelper: TriggerTestCleanupHelper;
  let latencyHelper: EdgeFunctionLatencyHelper;
  let fixtures: TriggerTestFixture[] = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new TriggerTestFixtureBuilder(adminClient, supabaseClient);
    cleanupHelper = new TriggerTestCleanupHelper(adminClient);
    latencyHelper = new EdgeFunctionLatencyHelper(adminClient);
    fixtures = [];
  });

  afterEach(async () => {
    for (const fixture of fixtures) {
      await cleanupHelper.cleanupFixture(fixture);
    }
    fixtures = [];
  });

  it('should extract dtstart and until on INSERT when both are present', async () => {
    const fixture = await fixtureBuilder.createAvailabilityWithRrule(
      TriggerTestData.rruleFormats.withDtstartAndUntil
    );
    fixtures.push(fixture);

    // Wait for edge function to complete
    const availability = await latencyHelper.waitForEdgeFunction(
      fixture.availabilityId
    );

    assertExists(availability);
    assertExists(availability.dtstart);
    assertExists(availability.until);

    const dtstart = new Date(availability.dtstart);
    const until = new Date(availability.until);

    assertEquals(
      dtstart.getTime(),
      TriggerTestData.expectedDates.dtstart20240101.getTime()
    );
    assertEquals(
      until.getTime(),
      TriggerTestData.expectedDates.until20240131.getTime()
    );
  });

  it('should extract only dtstart on INSERT when UNTIL is missing', async () => {
    const fixture = await fixtureBuilder.createAvailabilityWithRrule(
      TriggerTestData.rruleFormats.withDtstartOnly
    );
    fixtures.push(fixture);

    // Wait for edge function to complete
    const availability = await latencyHelper.waitForEdgeFunction(
      fixture.availabilityId
    );

    assertExists(availability);
    assertExists(availability.dtstart);
    assertEquals(availability.until, null);

    const dtstart = new Date(availability.dtstart);
    assertEquals(
      dtstart.getTime(),
      TriggerTestData.expectedDates.dtstart20240101.getTime()
    );
  });

  it('should auto-generate dtstart and set until to NULL on INSERT when both are missing', async () => {
    const fixture = await fixtureBuilder.createAvailabilityWithRrule(
      TriggerTestData.rruleFormats.withoutDates
    );
    fixtures.push(fixture);

    // Wait for edge function to complete
    const availability = await latencyHelper.waitForEdgeFunction(
      fixture.availabilityId
    );

    assertExists(availability);
    // RRULE library auto-generates DTSTART when not provided (sets it to current time)
    assertExists(availability.dtstart);
    // Verify it's a valid date (auto-generated, so should be recent)
    const dtstart = new Date(availability.dtstart);
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - dtstart.getTime());
    // Should be within 5 seconds of current time (accounting for edge function latency)
    assertEquals(timeDiff < 5000, true);
    assertEquals(availability.until, null);
  });

  it('should set dtstart to NULL on INSERT when DTSTART format is invalid', async () => {
    const fixture = await fixtureBuilder.createAvailabilityWithRrule(
      TriggerTestData.rruleFormats.invalidDtstart
    );
    fixtures.push(fixture);

    // Wait for edge function to complete
    const availability = await latencyHelper.waitForEdgeFunction(
      fixture.availabilityId
    );

    assertExists(availability);
    assertEquals(availability.dtstart, null);
  });

  it('should set both dtstart and until to NULL on INSERT when UNTIL format is invalid', async () => {
    const fixture = await fixtureBuilder.createAvailabilityWithRrule(
      TriggerTestData.rruleFormats.invalidUntil
    );
    fixtures.push(fixture);

    // Wait for edge function to complete
    // Note: When parsing fails (invalid UNTIL), the edge function returns badRequest
    // and doesn't update the database, so both fields remain NULL (as set by the trigger)
    const availability = await latencyHelper.waitForEdgeFunction(
      fixture.availabilityId
    );

    assertExists(availability);
    // Since parsing fails entirely, the database is not updated
    // Both fields remain NULL as initially set by the trigger
    assertEquals(availability.dtstart, null);
    assertEquals(availability.until, null);
  });

  it('should extract dtstart and until on INSERT when dates are without Z suffix', async () => {
    const fixture = await fixtureBuilder.createAvailabilityWithRrule(
      TriggerTestData.rruleFormats.dtstartWithoutZ
    );
    fixtures.push(fixture);

    // Wait for edge function to complete
    const availability = await latencyHelper.waitForEdgeFunction(
      fixture.availabilityId
    );

    assertExists(availability);
    assertExists(availability.dtstart);
    assertExists(availability.until);

    const dtstart = new Date(availability.dtstart);
    const until = new Date(availability.until);

    assertEquals(
      dtstart.getTime(),
      TriggerTestData.expectedDates.dtstart20240101.getTime()
    );
    assertEquals(
      until.getTime(),
      TriggerTestData.expectedDates.until20240131.getTime()
    );
  });

  it('should update dtstart and until on UPDATE of rrule', async () => {
    const fixture = await fixtureBuilder.createAvailabilityWithRrule(
      TriggerTestData.rruleFormats.withDtstartAndUntil
    );
    fixtures.push(fixture);

    const newRrule = `DTSTART:20240201T100000Z
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`;

    const { error: updateError } = await adminClient
      .from('availabilities')
      .update({ rrule: newRrule })
      .eq('id', fixture.availabilityId);

    assertEquals(updateError, null);

    // Wait for edge function to complete after update
    const availability = await latencyHelper.waitForEdgeFunction(
      fixture.availabilityId
    );

    assertExists(availability);
    assertExists(availability.dtstart);
    assertEquals(availability.until, null);

    const dtstart = new Date(availability.dtstart);
    assertEquals(
      dtstart.getTime(),
      TriggerTestData.expectedDates.dtstart20240201.getTime()
    );
  });

  it('should not update dtstart and until on UPDATE of other fields', async () => {
    const fixture = await fixtureBuilder.createAvailabilityWithRrule(
      TriggerTestData.rruleFormats.withDtstartAndUntil
    );
    fixtures.push(fixture);

    // Wait for initial edge function to complete
    const availabilityBefore = await latencyHelper.waitForEdgeFunction(
      fixture.availabilityId
    );

    assertExists(availabilityBefore);

    const { error: updateError } = await adminClient
      .from('availabilities')
      .update({
        duration_mn: 360,
      })
      .eq('id', fixture.availabilityId);

    assertEquals(updateError, null);

    // Wait a bit to ensure no edge function was triggered (since rrule didn't change)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: availabilityAfter, error: errorAfter } = await adminClient
      .from('availabilities')
      .select('dtstart, until')
      .eq('id', fixture.availabilityId)
      .single();

    assertEquals(errorAfter, null);
    assertExists(availabilityAfter);

    assertEquals(availabilityBefore.dtstart, availabilityAfter.dtstart);
    assertEquals(availabilityBefore.until, availabilityAfter.until);
  });

  it('should use first DTSTART when multiple DTSTART lines are present', async () => {
    const fixture = await fixtureBuilder.createAvailabilityWithRrule(
      TriggerTestData.rruleFormats.multipleDtstart
    );
    fixtures.push(fixture);

    // Wait for edge function to complete
    const availability = await latencyHelper.waitForEdgeFunction(
      fixture.availabilityId
    );

    assertExists(availability);
    assertExists(availability.dtstart);

    const dtstart = new Date(availability.dtstart);
    assertEquals(
      dtstart.getTime(),
      TriggerTestData.expectedDates.dtstart20240101.getTime()
    );
  });

  it('should use first UNTIL when multiple UNTIL lines are present', async () => {
    const fixture = await fixtureBuilder.createAvailabilityWithRrule(
      TriggerTestData.rruleFormats.multipleUntil
    );
    fixtures.push(fixture);

    // Wait for edge function to complete
    const availability = await latencyHelper.waitForEdgeFunction(
      fixture.availabilityId
    );

    assertExists(availability);
    assertExists(availability.dtstart);
    assertExists(availability.until);

    const until = new Date(availability.until);
    assertEquals(
      until.getTime(),
      TriggerTestData.expectedDates.until20240131.getTime()
    );
  });
});
