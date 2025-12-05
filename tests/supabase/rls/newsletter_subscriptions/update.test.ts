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

describe('Newsletter Subscriptions RLS - UPDATE', () => {
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

  it('should prevent unauthenticated users from updating subscriptions', async () => {
    const subscription = await fixtureBuilder.createSubscription();
    fixtures.push(subscription);

    const { data: originalData } = await adminClient
      .from('newsletter_subscriptions')
      .select('name')
      .eq('id', subscription.id)
      .single();

    assertExists(originalData);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('newsletter_subscriptions')
      .update({ name: 'Updated Name' })
      .eq('id', subscription.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: verifyData } = await adminClient
      .from('newsletter_subscriptions')
      .select('name')
      .eq('id', subscription.id)
      .single();

    assertEquals(verifyData?.name, originalData.name);
  });

  it('should prevent authenticated users (non-admins) from updating subscriptions', async () => {
    const subscription = await fixtureBuilder.createSubscription();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(subscription, admin);

    // Create a non-admin user by creating a professional profile
    const { data: authData } = await adminClient.auth.admin.createUser({
      email: `test-user-${Date.now()}@example.com`,
      email_confirm: true,
      password: 'testpassword123',
    });

    if (!authData.user) {
      throw new Error('Failed to create test user');
    }

    await adminClient.from('profiles').insert({
      email: authData.user.email!,
      first_name: 'Test',
      last_name: 'User',
      role: 'professional',
      user_id: authData.user.id,
    });

    const authClient = supabaseClient.createAuthenticatedClient('dummy-token');
    const { data: signInData } = await authClient.auth.signInWithPassword({
      email: authData.user.email!,
      password: 'testpassword123',
    });

    if (!signInData.session) {
      throw new Error('Failed to sign in test user');
    }

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      signInData.session.access_token
    );

    const { data: originalData } = await adminClient
      .from('newsletter_subscriptions')
      .select('name')
      .eq('id', subscription.id)
      .single();

    assertExists(originalData);

    const { data, error } = await authenticatedClient
      .from('newsletter_subscriptions')
      .update({ name: 'Updated Name' })
      .eq('id', subscription.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: verifyData } = await adminClient
      .from('newsletter_subscriptions')
      .select('name')
      .eq('id', subscription.id)
      .single();

    assertEquals(verifyData?.name, originalData.name);

    // Cleanup
    await adminClient.from('profiles').delete().eq('user_id', authData.user.id);
    await adminClient.auth.admin.deleteUser(authData.user.id);
  });

  it('should allow admins to update subscriptions', async () => {
    const subscription = await fixtureBuilder.createSubscription();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(subscription, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('newsletter_subscriptions')
      .update({ name: 'Admin Updated Name' })
      .eq('id', subscription.id)
      .select('id, email, name')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.name, 'Admin Updated Name');
    assertEquals(data.id, subscription.id);
  });
});
