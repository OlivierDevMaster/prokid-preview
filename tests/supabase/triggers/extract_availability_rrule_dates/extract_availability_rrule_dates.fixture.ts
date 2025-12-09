import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface TriggerTestFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  availabilityId: string;
  professionalId: string;
  supabaseClient: SupabaseTestClient;
}

export class TriggerTestCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  async cleanupFixture(fixture: TriggerTestFixture): Promise<void> {
    try {
      await this.adminClient
        .from('availabilities')
        .delete()
        .eq('id', fixture.availabilityId);

      await this.adminClient
        .from('professionals')
        .delete()
        .eq('user_id', fixture.professionalId);

      await this.adminClient
        .from('profiles')
        .delete()
        .eq('user_id', fixture.professionalId);

      await this.adminClient.auth.admin.deleteUser(fixture.professionalId);
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

  async createAvailabilityWithRrule(
    rrule: string
  ): Promise<TriggerTestFixture> {
    const professionalEmail = `test-professional-${Date.now()}@example.com`;

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
          skills: ['skill1'],
          user_id: professionalId,
        })
        .select('user_id')
        .single();

    if (professionalError || !professionalData) {
      throw new Error(
        `Failed to create professional: ${professionalError?.message}`
      );
    }

    const { data: availabilityData, error: availabilityError } =
      await this.adminClient
        .from('availabilities')
        .insert({
          duration_mn: 240,
          rrule: rrule,
          user_id: professionalId,
        })
        .select('id')
        .single();

    if (availabilityError || !availabilityData) {
      throw new Error(
        `Failed to create availability: ${availabilityError?.message}`
      );
    }

    return {
      adminClient: this.adminClient,
      availabilityId: availabilityData.id,
      professionalId,
      supabaseClient: this.supabaseClient,
    };
  }
}
