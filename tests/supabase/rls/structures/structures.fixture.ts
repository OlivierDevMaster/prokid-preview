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

export interface ProfessionalRlsFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  email: string;
  professionalId?: string;
  supabaseClient: SupabaseTestClient;
  token: string;
  userId: string;
}

export interface StructureRlsFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  email: string;
  structureId?: string;
  supabaseClient: SupabaseTestClient;
  token: string;
  userId: string;
}

export class StructureRlsCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  async cleanupAdmin(fixture: AdminRlsFixture): Promise<void> {
    // Always try to delete profile
    try {
      await this.adminClient
        .from('profiles')
        .delete()
        .eq('user_id', fixture.userId);
    } catch (error) {
      console.warn('Cleanup warning (profiles):', error);
    }

    // Always try to delete auth user
    try {
      await this.adminClient.auth.admin.deleteUser(fixture.userId);
    } catch (error) {
      console.warn('Cleanup warning (auth user):', error);
    }
  }

  async cleanupProfessional(fixture: ProfessionalRlsFixture): Promise<void> {
    try {
      // Delete related records first (reports that reference this professional)
      if (fixture.professionalId) {
        await this.adminClient
          .from('reports')
          .delete()
          .eq('author_id', fixture.userId);
      }

      // Delete the professional
      if (fixture.professionalId) {
        await this.adminClient
          .from('professionals')
          .delete()
          .eq('user_id', fixture.userId);
      }
    } catch (error) {
      console.warn('Cleanup warning (professionals/reports):', error);
    }

    // Always try to delete profile, even if professional deletion failed
    try {
      await this.adminClient
        .from('profiles')
        .delete()
        .eq('user_id', fixture.userId);
    } catch (error) {
      console.warn('Cleanup warning (profiles):', error);
    }

    // Always try to delete auth user
    try {
      await this.adminClient.auth.admin.deleteUser(fixture.userId);
    } catch (error) {
      console.warn('Cleanup warning (auth user):', error);
    }
  }

  async cleanupStructure(fixture: StructureRlsFixture): Promise<void> {
    try {
      // Delete related records first (reports that reference this structure)
      if (fixture.structureId) {
        await this.adminClient
          .from('reports')
          .delete()
          .eq('recipient_id', fixture.userId);
      }

      // Delete the structure
      if (fixture.structureId) {
        await this.adminClient
          .from('structures')
          .delete()
          .eq('user_id', fixture.userId);
      }
    } catch (error) {
      console.warn('Cleanup warning (structures/reports):', error);
    }

    // Always try to delete profile, even if structure deletion failed
    try {
      await this.adminClient
        .from('profiles')
        .delete()
        .eq('user_id', fixture.userId);
    } catch (error) {
      console.warn('Cleanup warning (profiles):', error);
    }

    // Always try to delete auth user
    try {
      await this.adminClient.auth.admin.deleteUser(fixture.userId);
    } catch (error) {
      console.warn('Cleanup warning (auth user):', error);
    }
  }
}

export class StructureRlsFixtureBuilder {
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
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    const userId = authData.user.id;

    await new Promise(resolve => setTimeout(resolve, 100));

    // Clean up any orphaned profile that might exist (from previous failed tests)
    await this.adminClient.from('profiles').delete().eq('user_id', userId);

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

  async createAuthenticatedUser(): Promise<ProfessionalRlsFixture> {
    const email = `test-user-rls-${Date.now()}@example.com`;

    const { data: authData, error: authError } =
      await this.adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: {
          first_name: 'Test',
          last_name: 'User',
          role: 'professional',
        },
      });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    const userId = authData.user.id;

    await new Promise(resolve => setTimeout(resolve, 100));

    // Clean up any orphaned profile that might exist (from previous failed tests)
    await this.adminClient.from('profiles').delete().eq('user_id', userId);

    const { error: profileError } = await this.adminClient
      .from('profiles')
      .insert({
        email,
        first_name: 'Test',
        last_name: 'User',
        role: 'professional',
        user_id: userId,
      });

    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

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

  async createOnboardedStructure(): Promise<StructureRlsFixture> {
    const email = `test-structure-rls-${Date.now()}@example.com`;

    const { data: authData, error: authError } =
      await this.adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: {
          first_name: 'Test',
          last_name: 'Structure',
          role: 'structure',
        },
      });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    const userId = authData.user.id;

    await new Promise(resolve => setTimeout(resolve, 100));

    // Clean up any orphaned profile that might exist (from previous failed tests)
    await this.adminClient.from('profiles').delete().eq('user_id', userId);

    const { error: profileError } = await this.adminClient
      .from('profiles')
      .insert({
        email,
        first_name: 'Test',
        last_name: 'Structure',
        role: 'structure',
        user_id: userId,
      });

    if (profileError) {
      throw new Error(
        `Failed to create structure profile: ${profileError.message}`
      );
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const { data: structureData, error: structureError } =
      await this.adminClient
        .from('structures')
        .insert({
          name: 'Test Structure',
          user_id: userId,
        })
        .select('user_id')
        .single();

    if (structureError || !structureData) {
      throw new Error(`Failed to create structure: ${structureError?.message}`);
    }

    await this.adminClient
      .from('profiles')
      .update({ is_onboarded: true })
      .eq('user_id', userId);

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
      structureId: structureData.user_id,
      supabaseClient: this.supabaseClient,
      token,
      userId,
    };
  }
}
