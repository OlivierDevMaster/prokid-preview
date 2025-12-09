import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface NewsletterSubscriptionTestFixture {
  email: string;
  id: string;
  name: null | string;
}

export class NewsletterSubscriptionCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  async cleanupSubscription(
    fixture: NewsletterSubscriptionTestFixture
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

export class NewsletterSubscriptionFixtureBuilder {
  private adminClient: ReturnType<typeof createClient<Database>>;
  private supabaseClient: SupabaseTestClient;

  constructor(
    adminClient: ReturnType<typeof createClient<Database>>,
    supabaseClient: SupabaseTestClient
  ) {
    this.adminClient = adminClient;
    this.supabaseClient = supabaseClient;
  }

  async createSubscription(
    email?: string,
    name?: null | string
  ): Promise<NewsletterSubscriptionTestFixture> {
    const subscriptionEmail =
      email || `test-subscription-${Date.now()}@example.com`;

    const { data, error } = await this.adminClient
      .from('newsletter_subscriptions')
      .insert({
        email: subscriptionEmail,
        name: name ?? null,
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
