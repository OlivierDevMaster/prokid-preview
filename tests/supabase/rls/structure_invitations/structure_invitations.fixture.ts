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

export class StructureInvitationRlsCleanupHelper {
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

  async cleanupInvitation(invitationId: string): Promise<void> {
    try {
      await this.adminClient
        .from('structure_invitations')
        .delete()
        .eq('id', invitationId);
    } catch (error) {
      console.warn('Cleanup warning (invitation):', error);
    }
  }

  async cleanupProfessional(fixture: ProfessionalRlsFixture): Promise<void> {
    try {
      if (fixture.professionalId) {
        await this.adminClient
          .from('professionals')
          .delete()
          .eq('user_id', fixture.userId);
      }

      await this.adminClient
        .from('profiles')
        .delete()
        .eq('user_id', fixture.userId);

      await this.adminClient.auth.admin.deleteUser(fixture.userId);
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }

  async cleanupStructure(fixture: StructureRlsFixture): Promise<void> {
    try {
      if (fixture.structureId) {
        await this.adminClient
          .from('structures')
          .delete()
          .eq('user_id', fixture.userId);
      }

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

export class StructureInvitationRlsFixtureBuilder {
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

  async createOnboardedProfessional(): Promise<ProfessionalRlsFixture> {
    const email = `test-professional-rls-${Date.now()}@example.com`;

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

    await new Promise(resolve => setTimeout(resolve, 100));

    await this.adminClient.from('profiles').delete().eq('user_id', userId);

    const { error: profileError } = await this.adminClient
      .from('profiles')
      .insert({
        email,
        first_name: 'Test',
        last_name: 'Professional',
        role: 'professional',
        user_id: userId,
      });

    if (profileError) {
      throw new Error(
        `Failed to create professional profile: ${profileError.message}`
      );
    }

    await new Promise(resolve => setTimeout(resolve, 100));

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
          skills: ['skill1', 'skill2'],
          user_id: userId,
        })
        .select('user_id')
        .single();

    if (professionalError || !professionalData) {
      throw new Error(
        `Failed to create professional: ${professionalError?.message}`
      );
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
      professionalId: professionalData.user_id,
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
