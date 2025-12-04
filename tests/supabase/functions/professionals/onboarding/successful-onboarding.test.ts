import { assertEquals } from '@std/assert';
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

describe('Successful professional onboarding', () => {
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

  it('should onboard professional with valid data', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = ProfessionalTestData.validOnboardingRequest;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertSuccessfulOnboarding(
      response,
      data,
      requestBody
    );
    ProfessionalAssertions.assertContentType(response);
    ProfessionalAssertions.assertProfessionalBelongsToUser(
      data,
      fixture.userId
    );
    ProfessionalAssertions.assertProfessionalHasProfile(data);
    ProfessionalAssertions.assertValidTimestamps(data);
    ProfessionalAssertions.assertRecentlyCreated(data);
  });

  it('should onboard professional with minimal data', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = ProfessionalTestData.validOnboardingRequestMinimal;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertSuccessfulOnboarding(
      response,
      data,
      requestBody
    );
    ProfessionalAssertions.assertContentType(response);
    assertEquals(data.description, null);
    assertEquals(data.phone, null);
  });

  it('should handle long description', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = ProfessionalTestData.edgeCaseLongDescription;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertSuccessfulOnboarding(
      response,
      data,
      requestBody
    );
    ProfessionalAssertions.assertContentType(response);
  });

  it('should handle many skills', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = ProfessionalTestData.edgeCaseManySkills;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertSuccessfulOnboarding(
      response,
      data,
      requestBody
    );
    ProfessionalAssertions.assertContentType(response);
    assertEquals(data.skills.length, requestBody.skills.length);
  });

  it('should handle zero experience years', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = ProfessionalTestData.edgeCaseZeroExperience;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertSuccessfulOnboarding(
      response,
      data,
      requestBody
    );
    ProfessionalAssertions.assertContentType(response);
    assertEquals(data.experience_years, 0);
  });

  it('should handle large intervention radius', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = ProfessionalTestData.edgeCaseLargeRadius;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertSuccessfulOnboarding(
      response,
      data,
      requestBody
    );
    ProfessionalAssertions.assertContentType(response);
  });

  it('should handle high hourly rate', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = ProfessionalTestData.edgeCaseHighHourlyRate;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: fixture.token,
    });

    // Assert
    ProfessionalAssertions.assertSuccessfulOnboarding(
      response,
      data,
      requestBody
    );
    ProfessionalAssertions.assertContentType(response);
  });
});
