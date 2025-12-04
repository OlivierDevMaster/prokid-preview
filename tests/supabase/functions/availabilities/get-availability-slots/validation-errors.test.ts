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

describe('Validation errors', () => {
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

  it('should return validation error for missing professionalId', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithoutAvailabilities();
    const queryParams = AvailabilityTestData.invalidQueryParamsMissingProfessionalId;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      method: 'GET',
      name: 'availabilities',
      path: '/slots',
      queryParams,
      token: null,
    });

    // Assert
    AvailabilityAssertions.assertValidationError(response, data);
    AvailabilityAssertions.assertContentType(response);
  });

  it('should return validation error for missing startAt', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithoutAvailabilities();
    const queryParams = {
      ...AvailabilityTestData.invalidQueryParamsMissingStartAt,
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
    AvailabilityAssertions.assertValidationError(response, data);
    AvailabilityAssertions.assertContentType(response);
  });

  it('should return validation error for missing endAt', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithoutAvailabilities();
    const queryParams = {
      ...AvailabilityTestData.invalidQueryParamsMissingEndAt,
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
    AvailabilityAssertions.assertValidationError(response, data);
    AvailabilityAssertions.assertContentType(response);
  });

  it('should return validation error for invalid professionalId format', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithoutAvailabilities();
    const queryParams = {
      ...AvailabilityTestData.invalidQueryParamsInvalidProfessionalId,
      startAt: AvailabilityTestData.validQueryParams.startAt,
      endAt: AvailabilityTestData.validQueryParams.endAt,
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
    AvailabilityAssertions.assertValidationError(response, data);
    AvailabilityAssertions.assertContentType(response);
  });

  it('should return validation error for invalid startAt format', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithoutAvailabilities();
    const queryParams = {
      ...AvailabilityTestData.invalidQueryParamsInvalidStartAt,
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
    AvailabilityAssertions.assertInvalidDateFormat(response, data);
    AvailabilityAssertions.assertContentType(response);
  });

  it('should return validation error for invalid endAt format', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithoutAvailabilities();
    const queryParams = {
      ...AvailabilityTestData.invalidQueryParamsInvalidEndAt,
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
    AvailabilityAssertions.assertInvalidDateFormat(response, data);
    AvailabilityAssertions.assertContentType(response);
  });

  it('should return validation error when startAt is after endAt', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithoutAvailabilities();
    const queryParams = {
      ...AvailabilityTestData.invalidQueryParamsStartAfterEnd,
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
    AvailabilityAssertions.assertInvalidDateRange(response, data);
    AvailabilityAssertions.assertContentType(response);
  });

  it('should return validation error when startAt equals endAt', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalWithoutAvailabilities();
    const queryParams = {
      ...AvailabilityTestData.invalidQueryParamsStartEqualsEnd,
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
    AvailabilityAssertions.assertInvalidDateRange(response, data);
    AvailabilityAssertions.assertContentType(response);
  });
});

