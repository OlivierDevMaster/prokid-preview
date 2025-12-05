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

export interface ProfileRlsFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  email: string;
  role: 'professional' | 'structure';
  supabaseClient: SupabaseTestClient;
  token: string;
  userId: string;
}

export class ProfileRlsCleanupHelper {
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

  async cleanupProfile(fixture: ProfileRlsFixture): Promise<void> {
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
}

export class ProfileRlsFixtureBuilder {
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

  async createProfileUser(
    role: 'professional' | 'structure' = 'professional'
  ): Promise<ProfileRlsFixture> {
    const email = `test-profile-rls-${Date.now()}@example.com`;

    const { data: authData, error: authError } =
      await this.adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: {
          first_name: 'Test',
          last_name: 'User',
          role,
        },
      });

    if (authError || !authData.user) {
      const errorMessage = authError
        ? JSON.stringify(authError)
        : 'Unknown error';
      throw new Error(`Failed to create test user: ${errorMessage}`);
    }

    const userId = authData.user.id;

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 200));

    // Verify profile was created by trigger
    let profileExists = false;
    for (let i = 0; i < 5; i++) {
      const { data: profileData } = await this.adminClient
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        profileExists = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!profileExists) {
      throw new Error(
        `Profile was not created by trigger for user ${userId}. Trigger may have failed.`
      );
    }

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
      role,
      supabaseClient: this.supabaseClient,
      token,
      userId,
    };
  }
}
