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

describe('Successful availability slots retrieval', () => {
  let supabaseClient: SupabaseTestClient;
  let apiHelper: ApiTestHelper;
  let fixtureBuilder: AvailabilityFixtureBuilder;
  let cleanupHelper: AvailabilityCleanupHelper;
  let fixture: AvailabilityTestFixture;

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    const adminClient = supabaseClient.createAdminClient();
    apiHelper = new ApiTestHelper(supabaseClient);
    fixtureBuilder = new AvailabilityFixtureBuilder(adminClient, supabaseClient);
    cleanupHelper = new AvailabilityCleanupHelper(adminClient);
  });

  afterEach(async () => {
    if (fixture) {
      await cleanupHelper.cleanupFixture(fixture);
    }
  });

  it('should retrieve empty slots array for professional without availabilities', async () => {
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
    AvailabilityAssertions.assertSuccessfulSlotsResponse(response, data, 0);
    AvailabilityAssertions.assertContentType(response);
    assertEquals(data.length, 0);
  });

  it('should retrieve slots for professional with single availability', async () => {
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
    AvailabilityAssertions.assertSuccessfulSlotsResponse(response, data, 1);
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

  it('should retrieve slots for professional with multiple availabilities', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithMultipleAvailabilities();
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
    AvailabilityAssertions.assertSuccessfulSlotsResponse(response, data, 1);
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

  it('should retrieve slots for large date range', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithAvailability();
    const queryParams = {
      ...AvailabilityTestData.edgeCaseLargeDateRange,
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

  it('should retrieve slots for small date range', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithAvailability();
    const queryParams = {
      ...AvailabilityTestData.edgeCaseSmallDateRange,
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

