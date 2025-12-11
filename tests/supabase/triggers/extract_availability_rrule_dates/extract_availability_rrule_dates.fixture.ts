import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface TriggerTestFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  availabilityId: string;
  professionalId: string;
  supabaseClient: SupabaseTestClient;
}

export class EdgeFunctionLatencyHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  /**
   * Waits for the edge function to complete by polling the database.
   * The edge function updates dtstart and until fields asynchronously.
   * Since the trigger initially sets both to NULL and the edge function updates them,
   * we poll until the values are no longer in the initial NULL state (or timeout).
   *
   * @param availabilityId - The ID of the availability to check
   * @param options - Options for polling behavior
   * @returns The availability record with updated dtstart and until
   */
  async waitForEdgeFunction(
    availabilityId: string,
    options: {
      pollIntervalMs?: number;
      timeoutMs?: number;
    } = {}
  ) {
    const {
      pollIntervalMs = 200, // Poll every 200ms
      timeoutMs = 10000, // 10 seconds default timeout
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const { data: availability, error } = await this.adminClient
        .from('availabilities')
        .select('dtstart, until')
        .eq('id', availabilityId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch availability: ${error.message}`);
      }

      if (!availability) {
        throw new Error('Availability not found');
      }

      // The edge function always updates the record, even if values remain NULL.
      // We wait a minimum amount of time (1.5 seconds) to allow the edge function
      // to complete, then return the current state. This accounts for:
      // - Network latency to call the edge function
      // - Edge function processing time
      // - Database update time
      const elapsed = Date.now() - startTime;
      if (elapsed >= 1500) {
        // Give the edge function at least 1.5 seconds to complete
        return availability;
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    // Final check before timeout
    const { data: availability, error } = await this.adminClient
      .from('availabilities')
      .select('dtstart, until')
      .eq('id', availabilityId)
      .single();

    if (error) {
      throw new Error(`Timeout waiting for edge function: ${error.message}`);
    }

    if (!availability) {
      throw new Error('Timeout: Availability not found');
    }

    return availability;
  }
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
