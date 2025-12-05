/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any

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

describe('Edge cases', () => {
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

  it('should handle non-existent professionalId', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithoutAvailabilities();
    const queryParams = {
      ...AvailabilityTestData.validQueryParams,
      professionalId: AvailabilityTestData.testUuids.nonExistent,
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
  });

  it('should handle date range with no matching slots', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithAvailability();
    // Use a date range in the past before the availability starts
    const queryParams = {
      endAt: '2020-01-31T23:59:59Z',
      professionalId: fixture.professionalId!,
      startAt: '2020-01-01T00:00:00Z',
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
  });

  it('should handle date range in the far future', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithAvailability();
    const queryParams = {
      endAt: '2030-01-31T23:59:59Z',
      professionalId: fixture.professionalId!,
      startAt: '2030-01-01T00:00:00Z',
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
    data.forEach((slot: any) => {
      AvailabilityAssertions.assertSlotStructure(slot);
    });
    AvailabilityAssertions.assertSlotsSorted(data);
    AvailabilityAssertions.assertSlotsInDateRange(
      data,
      queryParams.startAt,
      queryParams.endAt
    );
  });

  it('should handle same day date range', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithAvailability();
    const queryParams = {
      ...AvailabilityTestData.edgeCaseSameDay,
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
    data.forEach((slot: any) => {
      AvailabilityAssertions.assertSlotStructure(slot);
    });
    AvailabilityAssertions.assertSlotsSorted(data);
    AvailabilityAssertions.assertSlotsInDateRange(
      data,
      queryParams.startAt,
      queryParams.endAt
    );
  });
});
