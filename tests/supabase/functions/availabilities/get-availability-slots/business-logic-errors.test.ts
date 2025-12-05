/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// deno-lint-ignore-file no-unused-vars no-explicit-any
import { assertEquals } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../../helpers/SupabaseTestClient.ts';
import { AvailabilityAssertions } from '../availabilities.assertion.ts';
import { AvailabilityTestData } from '../availabilities.data.ts';
import {
  AvailabilityCleanupHelper,
  AvailabilityFixtureBuilder,
  AvailabilityTestFixture,
} from '../availabilities.fixture.ts';

describe('Business logic errors', () => {
  let supabaseClient: SupabaseTestClient;
  let apiHelper: ApiTestHelper;
  let fixtureBuilder: AvailabilityFixtureBuilder;
  let cleanupHelper: AvailabilityCleanupHelper;
  let fixture: AvailabilityTestFixture;

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    const adminClient = supabaseClient.createAdminClient();
    apiHelper = new ApiTestHelper(supabaseClient);
    fixtureBuilder = new AvailabilityFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new AvailabilityCleanupHelper(adminClient);
  });

  afterEach(async () => {
    if (fixture) {
      await cleanupHelper.cleanupFixture(fixture);
    }
  });

  it('should skip availabilities with invalid RRULE and return valid slots', async () => {
    // Arrange
    fixture = await fixtureBuilder.createOnboardedProfessional();

    // Create a valid availability
    const validRrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    const { data: validAvailability } = await fixture.adminClient
      .from('availabilities')
      .insert({
        duration_mn: 180,
        rrule: validRrule,
        user_id: fixture.professionalId!,
      })
      .select('id')
      .single();

    // Create an availability with invalid RRULE
    const invalidRrule = `INVALID_RRULE_FORMAT`;
    await fixture.adminClient.from('availabilities').insert({
      duration_mn: 240,
      rrule: invalidRrule,
      user_id: fixture.professionalId!,
    });

    const queryParams = {
      ...AvailabilityTestData.validQueryParams,
      professionalId: fixture.professionalId!,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'availabilities',
      path: '/slots',
      queryParams,
      token: null,
    });

    // Assert
    AvailabilityAssertions.assertSuccessfulSlotsResponse(response, data);
    AvailabilityAssertions.assertContentType(response);
    // Should return slots from valid availability only
    assertEquals(data.length > 0, true);
    data.forEach((slot: any) => {
      AvailabilityAssertions.assertSlotStructure(slot);
    });
  });

  it('should correctly calculate slot endAt based on duration_mn', async () => {
    // Arrange
    fixture = await fixtureBuilder.createOnboardedProfessional();

    // Create availability with 120 minutes duration
    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    await fixture.adminClient.from('availabilities').insert({
      duration_mn: 120,
      rrule,
      user_id: fixture.professionalId!,
    });

    const queryParams = {
      ...AvailabilityTestData.validQueryParams,
      professionalId: fixture.professionalId!,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'availabilities',
      path: '/slots',
      queryParams,
      token: null,
    });

    // Assert
    AvailabilityAssertions.assertSuccessfulSlotsResponse(response, data);
    AvailabilityAssertions.assertContentType(response);
    assertEquals(data.length > 0, true);

    // Verify duration is exactly 120 minutes (2 hours)
    for (const slot of data) {
      const startDate = new Date(slot.startAt);
      const endDate = new Date(slot.endAt);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationMinutes = durationMs / (60 * 1000);
      assertEquals(durationMinutes, 120);
    }
  });

  it('should aggregate slots from multiple availabilities', async () => {
    // Arrange
    fixture = await fixtureBuilder.createOnboardedProfessional();

    // Create multiple availabilities with different times
    const availabilities = [
      {
        duration_mn: 180,
        rrule: `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`,
        user_id: fixture.professionalId!,
      }, // Monday 9am-12pm
      {
        duration_mn: 240,
        rrule: `DTSTART:20250101T140000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`,
        user_id: fixture.professionalId!,
      }, // Monday 2pm-6pm
      {
        duration_mn: 360,
        rrule: `DTSTART:20250102T100000Z\nRRULE:FREQ=WEEKLY;BYDAY=TU`,
        user_id: fixture.professionalId!,
      }, // Tuesday 10am-4pm
    ];

    await fixture.adminClient.from('availabilities').insert(availabilities);

    const queryParams = {
      ...AvailabilityTestData.validQueryParams,
      professionalId: fixture.professionalId!,
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'availabilities',
      path: '/slots',
      queryParams,
      token: null,
    });

    // Assert
    AvailabilityAssertions.assertSuccessfulSlotsResponse(response, data);
    AvailabilityAssertions.assertContentType(response);
    // Should have slots from all three availabilities
    assertEquals(data.length >= 3, true);
    AvailabilityAssertions.assertSlotsSorted(data);
    data.forEach((slot: any) => {
      AvailabilityAssertions.assertSlotStructure(slot);
    });
  });

  it('should handle RRULE with EXDATE correctly', async () => {
    // Arrange
    fixture = await fixtureBuilder.createOnboardedProfessional();

    // Create availability with EXDATE (excluding specific dates)
    // Monday 9am-12pm, but excluding Jan 8, 2025 (which is a Monday)
    const rruleWithExdate = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO\nEXDATE:20250108T090000Z`;
    await fixture.adminClient.from('availabilities').insert({
      duration_mn: 180,
      rrule: rruleWithExdate,
      user_id: fixture.professionalId!,
    });

    const queryParams = {
      endAt: '2025-01-31T23:59:59Z',
      professionalId: fixture.professionalId!,
      startAt: '2025-01-01T00:00:00Z',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'availabilities',
      path: '/slots',
      queryParams,
      token: null,
    });

    // Assert
    AvailabilityAssertions.assertSuccessfulSlotsResponse(response, data);
    AvailabilityAssertions.assertContentType(response);

    // Verify that Jan 8, 2025 slot is excluded
    const excludedDate = new Date('2025-01-08T09:00:00Z');
    const hasExcludedSlot = data.some((slot: any) => {
      const slotStart = new Date(slot.startAt);
      return slotStart.getTime() === excludedDate.getTime();
    });
    assertEquals(hasExcludedSlot, false);

    // Verify other Monday slots are present
    assertEquals(data.length > 0, true);
    data.forEach((slot: any) => {
      AvailabilityAssertions.assertSlotStructure(slot);
    });
  });

  it('should handle different RRULE frequencies correctly', async () => {
    // Arrange
    fixture = await fixtureBuilder.createOnboardedProfessional();

    // Create availabilities with different frequencies
    const availabilities = [
      {
        duration_mn: 180,
        rrule: `DTSTART:20250101T090000Z\nRRULE:FREQ=DAILY;INTERVAL=1`,
        user_id: fixture.professionalId!,
      }, // Daily
      {
        duration_mn: 240,
        rrule: `DTSTART:20250101T140000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`,
        user_id: fixture.professionalId!,
      }, // Weekly on Mon, Wed, Fri
    ];

    await fixture.adminClient.from('availabilities').insert(availabilities);

    const queryParams = {
      endAt: '2025-01-07T23:59:59Z', // One week
      professionalId: fixture.professionalId!,
      startAt: '2025-01-01T00:00:00Z',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'availabilities',
      path: '/slots',
      queryParams,
      token: null,
    });

    // Assert
    AvailabilityAssertions.assertSuccessfulSlotsResponse(response, data);
    AvailabilityAssertions.assertContentType(response);
    // Daily should have 7 slots, weekly should have 3 slots (Mon, Wed, Fri)
    assertEquals(data.length >= 10, true);
    AvailabilityAssertions.assertSlotsSorted(data);
    data.forEach((slot: any) => {
      AvailabilityAssertions.assertSlotStructure(slot);
    });
  });

  it('should only return slots within the specified date range', async () => {
    // Arrange
    fixture = await fixtureBuilder.createOnboardedProfessional();

    // Create availability that spans beyond the query range
    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    await fixture.adminClient.from('availabilities').insert({
      duration_mn: 180,
      rrule,
      user_id: fixture.professionalId!,
    });

    // Query for a narrow date range
    const queryParams = {
      endAt: '2025-01-13T23:59:59Z', // Monday Jan 13
      professionalId: fixture.professionalId!,
      startAt: '2025-01-06T00:00:00Z', // Monday Jan 6
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'availabilities',
      path: '/slots',
      queryParams,
      token: null,
    });

    // Assert
    AvailabilityAssertions.assertSuccessfulSlotsResponse(response, data);
    AvailabilityAssertions.assertContentType(response);
    // Should only have slots for Jan 6 and Jan 13 (2 Mondays in range)
    assertEquals(data.length, 2);
    AvailabilityAssertions.assertSlotsInDateRange(
      data,
      queryParams.startAt,
      queryParams.endAt
    );
    data.forEach((slot: any) => {
      AvailabilityAssertions.assertSlotStructure(slot);
    });
  });

  it('should handle empty result when no availabilities match date range', async () => {
    // Arrange
    fixture = await fixtureBuilder.createOnboardedProfessional();

    // Create availability starting in February
    const rrule = `DTSTART:20250201T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    await fixture.adminClient.from('availabilities').insert({
      duration_mn: 180,
      rrule,
      user_id: fixture.professionalId!,
    });

    // Query for January (before availability starts)
    const queryParams = {
      endAt: '2025-01-31T23:59:59Z',
      professionalId: fixture.professionalId!,
      startAt: '2025-01-01T00:00:00Z',
    };

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'availabilities',
      path: '/slots',
      queryParams,
      token: null,
    });

    // Assert
    AvailabilityAssertions.assertSuccessfulSlotsResponse(response, data, 0);
    AvailabilityAssertions.assertContentType(response);
    assertEquals(data.length, 0);
  });
});
