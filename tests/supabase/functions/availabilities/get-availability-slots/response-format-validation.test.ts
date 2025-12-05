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

describe('Response format validation', () => {
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

  it('should return valid JSON response structure', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithoutAvailabilities();
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
    AvailabilityAssertions.assertResponseStructure(data);
    AvailabilityAssertions.assertContentType(response);
  });

  it('should return array of slots with correct structure', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithAvailability();
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
    data.forEach((slot: any) => {
      AvailabilityAssertions.assertSlotStructure(slot);
    });
  });

  it('should return slots sorted by startAt', async () => {
    // Arrange
    fixture =
      await fixtureBuilder.createProfessionalWithMultipleAvailabilities();
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
    AvailabilityAssertions.assertSlotsSorted(data);
  });

  it('should return slots within specified date range', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithAvailability();
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
    AvailabilityAssertions.assertSlotsInDateRange(
      data,
      queryParams.startAt,
      queryParams.endAt
    );
  });
});
