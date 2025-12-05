import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  NewsletterSubscriptionFixture,
  NewsletterSubscriptionRlsCleanupHelper,
  NewsletterSubscriptionRlsFixtureBuilder,
} from './newsletter_subscriptions.fixture.ts';

describe('Newsletter Subscriptions RLS - INSERT', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: NewsletterSubscriptionRlsFixtureBuilder;
  let cleanupHelper: NewsletterSubscriptionRlsCleanupHelper;
  let fixtures: Array<AdminRlsFixture | NewsletterSubscriptionFixture> = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new NewsletterSubscriptionRlsFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new NewsletterSubscriptionRlsCleanupHelper(adminClient);
  });

  afterEach(async () => {
    for (const fixture of fixtures) {
      if ('id' in fixture && 'email' in fixture) {
        await cleanupHelper.cleanupSubscription(
          fixture as NewsletterSubscriptionFixture
        );
      } else {
        await cleanupHelper.cleanupAdmin(fixture as AdminRlsFixture);
      }
    }
    fixtures = [];
  });

  it('should allow unauthenticated users to subscribe to newsletter', async () => {
    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const email = `test-public-${Date.now()}@example.com`;

    const { data, error } = await unauthenticatedClient
      .from('newsletter_subscriptions')
      .insert({
        email,
        name: 'Public Subscriber',
      })
      .select('id, email, name')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.email, email);
    assertEquals(data.name, 'Public Subscriber');

    fixtures.push({
      email: data.email,
      id: data.id,
      name: data.name,
    });
  });

  it('should allow authenticated users to subscribe to newsletter', async () => {
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(admin);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const email = `test-authenticated-${Date.now()}@example.com`;

    const { data, error } = await authenticatedClient
      .from('newsletter_subscriptions')
      .insert({
        email,
        name: 'Authenticated Subscriber',
      })
      .select('id, email, name')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.email, email);
    assertEquals(data.name, 'Authenticated Subscriber');

    fixtures.push({
      email: data.email,
      id: data.id,
      name: data.name,
    });
  });

  it('should allow subscription without name', async () => {
    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const email = `test-no-name-${Date.now()}@example.com`;

    const { data, error } = await unauthenticatedClient
      .from('newsletter_subscriptions')
      .insert({
        email,
      })
      .select('id, email, name')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.email, email);
    assertEquals(data.name, null);

    fixtures.push({
      email: data.email,
      id: data.id,
      name: data.name,
    });
  });
});
