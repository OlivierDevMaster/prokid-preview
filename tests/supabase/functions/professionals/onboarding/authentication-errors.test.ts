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

describe('Professional onboarding authentication errors', () => {
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

  it('should return unauthorized when no token is provided', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = ProfessionalTestData.validOnboardingRequest;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: null,
    });

    // Assert
    ProfessionalAssertions.assertUnauthorized(response, data);
  });

  it('should return unauthorized when invalid token is provided', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = ProfessionalTestData.validOnboardingRequest;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'professionals',
      path: '/onboarding',
      token: 'invalid-token',
    });

    // Assert
    ProfessionalAssertions.assertUnauthorized(response, data);
  });

  it('should return unauthorized when user is not a professional', async () => {
    // Arrange
    fixture = await fixtureBuilder.createNonProfessionalUser('structure');
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
    ProfessionalAssertions.assertUnauthorized(response, data);
  });

  it('should return unauthorized when admin user tries to onboard', async () => {
    // Arrange
    fixture = await fixtureBuilder.createNonProfessionalUser('admin');
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
    ProfessionalAssertions.assertUnauthorized(response, data);
  });

  it('should return unauthorized when professional is already onboarded', async () => {
    // Arrange
    fixture = await fixtureBuilder.createOnboardedProfessional();
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
    ProfessionalAssertions.assertUnauthorized(response, data);
  });
});
