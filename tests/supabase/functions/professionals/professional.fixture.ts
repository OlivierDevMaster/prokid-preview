import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface ProfessionalTestFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  email: string;
  professionalId?: string;
  supabaseClient: SupabaseTestClient;
  token: string;
  userId: string;
}

/**
 * Cleanup helper for professional fixtures
 */
export class ProfessionalCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  /**
   * Clean up a professional fixture
   */
  async cleanupFixture(fixture: ProfessionalTestFixture): Promise<void> {
    try {
      // Delete professional if exists
      if (fixture.professionalId) {
        await this.adminClient
          .from('professionals')
          .delete()
          .eq('user_id', fixture.userId);
      }

      // Delete profile
      await this.adminClient
        .from('profiles')
        .delete()
        .eq('user_id', fixture.userId);

      // Delete the user
      await this.adminClient.auth.admin.deleteUser(fixture.userId);
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }
}

export class ProfessionalFixtureBuilder {
  private adminClient: ReturnType<typeof createClient<Database>>;
  private supabaseClient: SupabaseTestClient;

  constructor(
    adminClient: ReturnType<typeof createClient<Database>>,
    supabaseClient: SupabaseTestClient
  ) {
    this.adminClient = adminClient;
    this.supabaseClient = supabaseClient;
  }

  /**
   * Create a non-professional user (structure or admin)
   */
  async createNonProfessionalUser(
    role: 'admin' | 'structure' = 'structure'
  ): Promise<ProfessionalTestFixture> {
    const email = `test-${role}-${Date.now()}@example.com`;

    // Create a test user with non-professional role
    const { data: authData, error: authError } =
      await this.adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: {
          first_name: 'Test',
          last_name: role === 'structure' ? 'Structure' : 'Admin',
          role,
        },
      });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    const userId = authData.user.id;

    // Wait a bit for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // Sign in the user
    const authClient =
      this.supabaseClient.createAuthenticatedClient('dummy-token');

    const { data: signInData, error: signInError } =
      await authClient.auth.signInWithPassword({
        email,
        password: 'testpassword123',
      });

    if (signInError || !signInData.session) {
      throw new Error(`Failed to sign in test user: ${signInError?.message}`);
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

  /**
   * Create a professional user that is already onboarded
   */
  async createOnboardedProfessional(): Promise<ProfessionalTestFixture> {
    const fixture = await this.createProfessionalUser();

    // Create professional record
    const { data: professionalData, error: professionalError } =
      await this.adminClient
        .from('professionals')
        .insert({
          city: 'Paris',
          description: 'Test professional',
          experience_years: 5,
          hourly_rate: 50.0,
          intervention_radius_km: 10,
          phone: '+33123456789',
          postal_code: '75001',
          professional_email: fixture.email,
          skills: ['skill1', 'skill2'],
          user_id: fixture.userId,
        })
        .select('user_id')
        .single();

    if (professionalError || !professionalData) {
      throw new Error(
        `Failed to create professional: ${professionalError?.message}`
      );
    }

    // Update profile to mark as onboarded
    await this.adminClient
      .from('profiles')
      .update({ is_onboarded: true })
      .eq('user_id', fixture.userId);

    return {
      ...fixture,
      professionalId: professionalData.user_id,
    };
  }

  /**
   * Create a professional user fixture (not yet onboarded)
   */
  async createProfessionalUser(): Promise<ProfessionalTestFixture> {
    const email = `test-professional-${Date.now()}@example.com`;

    // Create a test user with professional role
    const { data: authData, error: authError } =
      await this.adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: {
          first_name: 'Test',
          last_name: 'Professional',
          role: 'professional',
        },
      });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    const userId = authData.user.id;

    // Wait a bit for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify profile was created
    const { data: profileData, error: profileError } = await this.adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError || !profileData) {
      throw new Error(
        `Failed to verify profile creation: ${profileError?.message}`
      );
    }

    // Create a separate authenticated client for user operations
    const authClient =
      this.supabaseClient.createAuthenticatedClient('dummy-token');

    // Sign in the user with the authenticated client to get a token
    const { data: signInData, error: signInError } =
      await authClient.auth.signInWithPassword({
        email,
        password: 'testpassword123',
      });

    if (signInError || !signInData.session) {
      throw new Error(`Failed to sign in test user: ${signInError?.message}`);
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
}
