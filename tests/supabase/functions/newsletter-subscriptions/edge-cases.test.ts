// deno-lint-ignore-file no-unused-vars
/* eslint-disable @typescript-eslint/no-unused-vars */
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { NewsletterSubscriptionAssertions } from './newsletterSubscription.assertion.ts';
import { NewsletterSubscriptionTestData } from './newsletterSubscription.data.ts';
import {
  NewsletterSubscriptionCleanupHelper,
  NewsletterSubscriptionFixtureBuilder,
  NewsletterSubscriptionTestFixture,
} from './newsletterSubscription.fixture.ts';

describe('Newsletter subscription edge cases', () => {
  let supabaseClient: SupabaseTestClient;
  let apiHelper: ApiTestHelper;
  let fixtureBuilder: NewsletterSubscriptionFixtureBuilder;
  let cleanupHelper: NewsletterSubscriptionCleanupHelper;
  let fixture: NewsletterSubscriptionTestFixture | null = null;

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    const adminClient = supabaseClient.createAdminClient();
    apiHelper = new ApiTestHelper(supabaseClient);
    fixtureBuilder = new NewsletterSubscriptionFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new NewsletterSubscriptionCleanupHelper(adminClient);
  });

  afterEach(async () => {
    if (fixture) {
      await cleanupHelper.cleanupSubscription(fixture);
      fixture = null;
    }
  });

  it('should handle long email address', async () => {
    // Arrange
    const requestBody = NewsletterSubscriptionTestData.edgeCaseLongEmail;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'newsletter-subscriptions',
      token: null,
    });

    // Assert
    NewsletterSubscriptionAssertions.assertSuccessfulSubscription(
      response,
      data,
      requestBody
    );
    NewsletterSubscriptionAssertions.assertContentType(response);

    fixture = data as NewsletterSubscriptionTestFixture;
  });

  it('should handle long name', async () => {
    // Arrange
    const requestBody = NewsletterSubscriptionTestData.edgeCaseLongName;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'newsletter-subscriptions',
      token: null,
    });

    // Assert
    NewsletterSubscriptionAssertions.assertSuccessfulSubscription(
      response,
      data,
      requestBody
    );
    NewsletterSubscriptionAssertions.assertContentType(response);

    fixture = data as NewsletterSubscriptionTestFixture;
  });

  it('should handle special characters in email and name', async () => {
    // Arrange
    const requestBody =
      NewsletterSubscriptionTestData.edgeCaseSpecialCharacters;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'newsletter-subscriptions',
      token: null,
    });

    // Assert
    NewsletterSubscriptionAssertions.assertSuccessfulSubscription(
      response,
      data,
      requestBody
    );
    NewsletterSubscriptionAssertions.assertContentType(response);

    fixture = data as NewsletterSubscriptionTestFixture;
  });
});
