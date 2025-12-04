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

describe('Professional onboarding edge cases', () => {
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

  it('should handle special characters in description', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = {
      ...ProfessionalTestData.validOnboardingRequest,
      description: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
    };

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

  it('should handle unicode characters in description', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = {
      ...ProfessionalTestData.validOnboardingRequest,
      description: 'Unicode: 🎉 émojis 中文 العربية',
    };

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

  it('should handle special characters in address', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = {
      ...ProfessionalTestData.validOnboardingRequest,
      address: '123 Rue de la République, Apt. 4B',
    };

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

  it('should handle skills with special characters', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = {
      ...ProfessionalTestData.validOnboardingRequest,
      skills: ['C++', 'C#', 'Node.js', 'React/Next.js'],
    };

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

  it('should handle phone number with international format', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = {
      ...ProfessionalTestData.validOnboardingRequest,
      phone: '+33 1 23 45 67 89',
    };

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

  it('should handle postal code with various formats', async () => {
    // Arrange
    fixture = await fixtureBuilder.createProfessionalUser();
    const requestBody = {
      ...ProfessionalTestData.validOnboardingRequest,
      postalCode: '75001',
    };

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

  afterEach(async () => {
    if (fixture) {
      await cleanupHelper.cleanupFixture(fixture);
    }
  });
});
