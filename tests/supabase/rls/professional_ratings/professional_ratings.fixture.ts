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
  membershipId?: string;
  professionalId?: string;
  ratingId?: string;
  supabaseClient: SupabaseTestClient;
  token: string;
  userId: string;
}

export interface StructureRlsFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  email: string;
  membershipId?: string;
  ratingId?: string;
  structureId?: string;
  supabaseClient: SupabaseTestClient;
  token: string;
  userId: string;
}

export class ProfessionalRatingsRlsCleanupHelper {
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

  async cleanupProfessional(fixture: ProfessionalRlsFixture): Promise<void> {
    try {
      if (fixture.ratingId) {
        await this.adminClient
          .from('professional_ratings')
          .delete()
          .eq('id', fixture.ratingId);
      }

      if (fixture.professionalId) {
        await this.adminClient
          .from('professional_ratings')
          .delete()
          .eq('professional_id', fixture.professionalId);
      }

      if (fixture.membershipId) {
        await this.adminClient
          .from('structure_members')
          .delete()
          .eq('id', fixture.membershipId);
      }

      if (fixture.professionalId) {
        await this.adminClient
          .from('structure_members')
          .delete()
          .eq('professional_id', fixture.professionalId);

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
      if (fixture.ratingId) {
        await this.adminClient
          .from('professional_ratings')
          .delete()
          .eq('id', fixture.ratingId);
      }

      if (fixture.structureId) {
        await this.adminClient
          .from('professional_ratings')
          .delete()
          .eq('structure_id', fixture.structureId);
      }

      if (fixture.membershipId) {
        await this.adminClient
          .from('structure_members')
          .delete()
          .eq('id', fixture.membershipId);
      }

      if (fixture.structureId) {
        await this.adminClient
          .from('structure_members')
          .delete()
          .eq('structure_id', fixture.structureId);

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

export class ProfessionalRatingsRlsFixtureBuilder {
  private adminClient: ReturnType<typeof createClient<Database>>;
  private supabaseClient: SupabaseTestClient;

  constructor(
    adminClient: ReturnType<typeof createClient<Database>>,
    supabaseClient: SupabaseTestClient
  ) {
    this.adminClient = adminClient;
    this.supabaseClient = supabaseClient;
  }

  async createActiveMembership(
    professionalId: string,
    structureId: string
  ): Promise<string> {
    const { data: membershipData, error: membershipError } =
      await this.adminClient
        .from('structure_members')
        .insert({
          professional_id: professionalId,
          structure_id: structureId,
        })
        .select('id')
        .single();

    if (membershipError || !membershipData) {
      throw new Error(
        `Failed to create membership: ${membershipError?.message}`
      );
    }

    return membershipData.id;
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
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    const { data: sessionData, error: sessionError } =
      await this.adminClient.auth.signInWithPassword({
        email,
        password: 'testpassword123',
      });

    if (sessionError || !sessionData.session) {
      throw new Error(`Failed to sign in: ${sessionError?.message}`);
    }

    return {
      adminClient: this.adminClient,
      email,
      supabaseClient: this.supabaseClient,
      token: sessionData.session.access_token,
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
        is_onboarded: true,
        last_name: 'Professional',
        role: 'professional',
        user_id: userId,
      });

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    const { error: professionalError } = await this.adminClient
      .from('professionals')
      .insert({
        city: 'Paris',
        experience_years: 5,
        hourly_rate: 50.0,
        intervention_radius_km: 10,
        user_id: userId,
      });

    if (professionalError) {
      throw new Error(
        `Failed to create professional: ${professionalError.message}`
      );
    }

    const { data: sessionData, error: sessionError } =
      await this.adminClient.auth.signInWithPassword({
        email,
        password: 'testpassword123',
      });

    if (sessionError || !sessionData.session) {
      throw new Error(`Failed to sign in: ${sessionError?.message}`);
    }

    return {
      adminClient: this.adminClient,
      email,
      professionalId: userId,
      supabaseClient: this.supabaseClient,
      token: sessionData.session.access_token,
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
        is_onboarded: true,
        last_name: 'Structure',
        role: 'structure',
        user_id: userId,
      });

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    const { error: structureError } = await this.adminClient
      .from('structures')
      .insert({
        name: 'Test Structure',
        user_id: userId,
      });

    if (structureError) {
      throw new Error(`Failed to create structure: ${structureError.message}`);
    }

    const { data: sessionData, error: sessionError } =
      await this.adminClient.auth.signInWithPassword({
        email,
        password: 'testpassword123',
      });

    if (sessionError || !sessionData.session) {
      throw new Error(`Failed to sign in: ${sessionError?.message}`);
    }

    return {
      adminClient: this.adminClient,
      email,
      structureId: userId,
      supabaseClient: this.supabaseClient,
      token: sessionData.session.access_token,
      userId,
    };
  }
}
