import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { NewsletterSubscriptionAssertions } from './newsletterSubscription.assertion.ts';
import {
  NewsletterSubscriptionCleanupHelper,
  NewsletterSubscriptionFixtureBuilder,
  NewsletterSubscriptionTestFixture,
} from './newsletterSubscription.fixture.ts';

describe('Newsletter subscription duplicate email', () => {
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

  it('should return conflict error when email is already subscribed', async () => {
    // Arrange - create first subscription
    const email = `duplicate-${Date.now()}@example.com`;
    fixture = await fixtureBuilder.createSubscription(
      email,
      'First Subscriber'
    );

    // Act - try to subscribe with the same email
    const { data, response } = await apiHelper.invokeEndpoint({
      body: {
        email,
        name: 'Second Subscriber',
      },
      method: 'POST',
      name: 'newsletter-subscriptions',
      token: null,
    });

    // Assert
    NewsletterSubscriptionAssertions.assertConflictError(response, data);
  });
});
