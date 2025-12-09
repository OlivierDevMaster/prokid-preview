import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface TriggerTestFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  email: string;
  supabaseClient: SupabaseTestClient;
  userId: string;
}

export class TriggerTestCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  async cleanupFixture(fixture: TriggerTestFixture): Promise<void> {
    try {
      await this.adminClient
        .from('profiles')
        .delete()
        .eq('user_id', fixture.userId);
      await this.adminClient.auth.admin.deleteUser(fixture.userId);
    } catch (error) {
      console.warn(`Cleanup warning for user ${fixture.userId}:`, error);
    }
  }
}

export class TriggerTestFixtureBuilder {
  private adminClient: ReturnType<typeof createClient<Database>>;
  private supabaseClient: SupabaseTestClient;

  constructor(
    adminClient: ReturnType<typeof createClient<Database>>,
    supabaseClient: SupabaseTestClient
  ) {
    this.adminClient = adminClient;
    this.supabaseClient = supabaseClient;
  }

  createAdminUser(): Promise<TriggerTestFixture> {
    return this.createUserWithMetadata({
      role: 'admin',
    });
  }

  createProfessionalUser(options?: {
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    preferred_language?: string;
  }): Promise<TriggerTestFixture> {
    return this.createUserWithMetadata({
      role: 'professional',
      ...options,
    });
  }

  createStructureUser(options?: {
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    preferred_language?: string;
  }): Promise<TriggerTestFixture> {
    return this.createUserWithMetadata({
      role: 'structure',
      ...options,
    });
  }

  createUserWithInvalidRole(): Promise<TriggerTestFixture> {
    return this.createUserWithMetadata({
      role: 'invalid_role',
    });
  }

  async createUserWithMetadata(metadata: {
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    preferred_language?: string;
    role?: string;
  }): Promise<TriggerTestFixture> {
    const email = `test-trigger-${Date.now()}@example.com`;

    const { data: authData, error: authError } =
      await this.adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: metadata,
      });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    const userId = authData.user.id;

    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      adminClient: this.adminClient,
      email,
      supabaseClient: this.supabaseClient,
      userId,
    };
  }

  createUserWithoutRole(): Promise<TriggerTestFixture> {
    return this.createUserWithMetadata({});
  }
}
