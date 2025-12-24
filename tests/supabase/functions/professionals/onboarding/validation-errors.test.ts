import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../../helpers/SupabaseTestClient.ts';
import { ProfessionalAssertions } from '../professional.assertion.ts';
import { ProfessionalTestData } from '../professional.data.ts';
import {
  ProfessionalCleanupHelper,
  ProfessionalFixtureBuilder,
  ProfessionalTestFixture,
} from '../professional.fixture.ts';

describe('Professional onboarding validation errors', () => {
  let supabaseClient: SupabaseTestClient;
  let apiHelper: ApiTestHelper;
  let fixtureBuilder: ProfessionalFixtureBuilder;
  let cleanupHelper: ProfessionalCleanupHelper;
  let fixture: ProfessionalTestFixture;

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    const adminClient = supabaseClient.createAdminClient();
    apiHelper = new ApiTestHelper(supabaseClient);
    fixtureBuilder = new ProfessionalFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new ProfessionalCleanupHelper(adminClient);
  });

  afterEach(async () => {
    if (fixture) {
      await cleanupHelper.cleanupFixture(fixture);
    }
  });

  it('should return validation error when address is missing', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody =
      ProfessionalTestData.invalidOnboardingRequestMissingAddress;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });

  it('should return validation error when city is missing', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody =
      ProfessionalTestData.invalidOnboardingRequestMissingCity;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });

  it('should return validation error when skills array is empty', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody =
      ProfessionalTestData.invalidOnboardingRequestEmptySkills;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });

  it('should return validation error when experience years is negative', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody =
      ProfessionalTestData.invalidOnboardingRequestNegativeExperience;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });

  it('should return validation error when hourly rate is negative', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody =
      ProfessionalTestData.invalidOnboardingRequestNegativeHourlyRate;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });

  it('should return validation error when intervention radius is negative', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody =
      ProfessionalTestData.invalidOnboardingRequestNegativeRadius;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });

  it('should return validation error when address is empty', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody =
      ProfessionalTestData.invalidOnboardingRequestEmptyAddress;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });

  it('should return validation error when city is empty', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = ProfessionalTestData.invalidOnboardingRequestEmptyCity;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });

  it('should return validation error when postal code is empty', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody =
      ProfessionalTestData.invalidOnboardingRequestEmptyPostalCode;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });

  it('should return validation error when request body is empty', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: {},
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });

  it('should return validation error when request body is null', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: null,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertValidationError(response, data);
  });
});
