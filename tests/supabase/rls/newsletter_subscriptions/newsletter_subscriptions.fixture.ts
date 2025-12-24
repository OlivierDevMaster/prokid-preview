import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface AdminRlsFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  email: string;
  supabaseClient: SupabaseTestClient;
  token: string;
  userId: string;
}

export interface NewsletterSubscriptionFixture {
  email: string;
  id: string;
  name: null | string;
}

export class NewsletterSubscriptionRlsCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  async cleanupAdmin(fixture: AdminRlsFixture): Promise<void> {
    try {
      await this.adminClient
        .from('profiles')
        .delete()
        .eq('user_id', fixture.userId);

      await this.adminClient.auth.admin.deleteUser(fixture.userId);
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }

  async cleanupSubscription(
    fixture: NewsletterSubscriptionFixture
  ): Promise<void> {
    try {
      await this.adminClient
        .from('newsletter_subscriptions')
        .delete()
        .eq('id', fixture.id);
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }
}

export class NewsletterSubscriptionRlsFixtureBuilder {
  private adminClient: ReturnType<typeof createClient<Database>>;
  private supabaseClient: SupabaseTestClient;

  constructor(
    adminClient: ReturnType<typeof createClient<Database>>,
    supabaseClient: SupabaseTestClient
  ) {
    this.adminClient = adminClient;
    this.supabaseClient = supabaseClient;
  }

  async createAdminUser(): Promise<AdminRlsFixture> {
    const email = `test-admin-rls-${Date.now()}@example.com`;

    const { data: authData, error: authError } =
      await this.adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: {
          first_name: 'Test',
          last_name: 'Admin',
          role: 'admin',
        },
      });

    if (authError || !authData.user) {
      const errorMessage = authError
        ? JSON.stringify(authError)
        : 'Unknown error';
      throw new Error(`Failed to create test user: ${errorMessage}`);
    }

    const userId = authData.user.id;

    await new Promise(resolve => setTimeout(resolve, 100));

    const { error: profileError } = await this.adminClient
      .from('profiles')
      .insert({
        email,
        first_name: 'Test',
        last_name: 'Admin',
        role: 'admin',
        user_id: userId,
      });

    if (profileError) {
      throw new Error(
        `Failed to create admin profile: ${profileError.message}`
      );
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const authClient =
      this.supabaseClient.createAuthenticatedClient('dummy-token');

    const { data: signInData, error: signInError } =
      await authClient.auth.signInWithPassword({
        email,
        password: 'testpassword123',
      });

    if (signInError || !signInData.session) {
      const errorMessage = signInError
        ? JSON.stringify(signInError)
        : 'Unknown error';
      throw new Error(`Failed to sign in test user: ${errorMessage}`);
    }

    const token = signInData.session.access_token;

    return {
      adminClient: this.adminClient,
      email,
      supabaseClient: this.supabaseClient,
      token,
      userId,
    };
  }

  async createSubscription(
    email?: string,
    name?: null | string
  ): Promise<NewsletterSubscriptionFixture> {
    const subscriptionEmail =
      email || `test-subscription-${Date.now()}@example.com`;
    const subscriptionName = name ?? `Test Subscriber ${Date.now()}`;

    const { data, error } = await this.adminClient
      .from('newsletter_subscriptions')
      .insert({
        email: subscriptionEmail,
        name: subscriptionName,
      })
      .select('id, email, name')
      .single();

    if (error || !data) {
      throw new Error(
        `Failed to create subscription: ${error?.message || 'Unknown error'}`
      );
    }

    return {
      email: data.email,
      id: data.id,
      name: data.name,
    };
  }
}
