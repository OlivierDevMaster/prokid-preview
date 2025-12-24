import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface TriggerTestFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  membershipId: string;
  professionalId: string;
  ratingId?: string;
  structureId: string;
  supabaseClient: SupabaseTestClient;
}

export class TriggerTestCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  async cleanupFixture(fixture: TriggerTestFixture): Promise<void> {
    try {
      if (fixture.ratingId) {
        await this.adminClient
          .from('professional_ratings')
          .delete()
          .eq('id', fixture.ratingId);
      }

      await this.adminClient
        .from('professional_ratings')
        .delete()
        .eq('professional_id', fixture.professionalId);

      await this.adminClient
        .from('structure_members')
        .delete()
        .eq('id', fixture.membershipId);

      await this.adminClient
        .from('structure_members')
        .delete()
        .eq('structure_id', fixture.structureId)
        .eq('professional_id', fixture.professionalId);

      await this.adminClient
        .from('professionals')
        .delete()
        .eq('user_id', fixture.professionalId);

      await this.adminClient
        .from('structures')
        .delete()
        .eq('user_id', fixture.structureId);

      await this.adminClient
        .from('profiles')
        .delete()
        .eq('user_id', fixture.professionalId);

      await this.adminClient
        .from('profiles')
        .delete()
        .eq('user_id', fixture.structureId);

      await this.adminClient.auth.admin.deleteUser(fixture.professionalId);
      await this.adminClient.auth.admin.deleteUser(fixture.structureId);
    } catch (error) {
      console.warn(`Cleanup warning:`, error);
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

  async createActiveMembership(): Promise<TriggerTestFixture> {
    const structureEmail = `test-structure-${Date.now()}@example.com`;
    const professionalEmail = `test-professional-${Date.now()}@example.com`;

    const { data: structureAuthData, error: structureAuthError } =
      await this.adminClient.auth.admin.createUser({
        email: structureEmail,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: { role: 'structure' },
      });

    if (structureAuthError || !structureAuthData.user) {
      throw new Error(
        `Failed to create structure user: ${structureAuthError?.message}`
      );
    }

    const structureId = structureAuthData.user.id;
    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: professionalAuthData, error: professionalAuthError } =
      await this.adminClient.auth.admin.createUser({
        email: professionalEmail,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: { role: 'professional' },
      });

    if (professionalAuthError || !professionalAuthData.user) {
      throw new Error(
        `Failed to create professional user: ${professionalAuthError?.message}`
      );
    }

    const professionalId = professionalAuthData.user.id;
    await new Promise(resolve => setTimeout(resolve, 200));

    // Structure is automatically created by handle_new_user trigger
    // Check if it exists first, if not create it
    const { data: existingStructure } = await this.adminClient
      .from('structures')
      .select('user_id')
      .eq('user_id', structureId)
      .maybeSingle();

    if (!existingStructure) {
      const { data: structureData, error: structureError } =
        await this.adminClient
          .from('structures')
          .insert({
            name: 'Test Structure',
            user_id: structureId,
          })
          .select('user_id')
          .single();

      if (structureError || !structureData) {
        throw new Error(
          `Failed to create structure: ${structureError?.message}`
        );
      }
    } else {
      // Update the name if structure already exists
      await this.adminClient
        .from('structures')
        .update({ name: 'Test Structure' })
        .eq('user_id', structureId);
    }

    // Professional profile is automatically created by handle_new_user trigger
    // Check if professional exists, if not create it
    const { data: existingProfessional } = await this.adminClient
      .from('professionals')
      .select('user_id')
      .eq('user_id', professionalId)
      .maybeSingle();

    if (!existingProfessional) {
      const { data: professionalData, error: professionalError } =
        await this.adminClient
          .from('professionals')
          .insert({
            city: 'Paris',
            experience_years: 5,
            hourly_rate: 50.0,
            intervention_radius_km: 10,
            user_id: professionalId,
          })
          .select('user_id')
          .single();

      if (professionalError || !professionalData) {
        throw new Error(
          `Failed to create professional: ${professionalError?.message}`
        );
      }
    }

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

    return {
      adminClient: this.adminClient,
      membershipId: membershipData.id,
      professionalId,
      structureId,
      supabaseClient: this.supabaseClient,
    };
  }
}
