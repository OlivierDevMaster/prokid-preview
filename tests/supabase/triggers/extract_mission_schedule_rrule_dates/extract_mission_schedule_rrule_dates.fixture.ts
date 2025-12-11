import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface TriggerTestFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  missionId: string;
  missionScheduleId: string;
  professionalId: string;
  structureId: string;
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
   * @param missionScheduleId - The ID of the mission schedule to check
   * @param options - Options for polling behavior
   * @returns The mission schedule record with updated dtstart and until
   */
  async waitForEdgeFunction(
    missionScheduleId: string,
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
      const { data: schedule, error } = await this.adminClient
        .from('mission_schedules')
        .select('dtstart, until')
        .eq('id', missionScheduleId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch mission schedule: ${error.message}`);
      }

      if (!schedule) {
        throw new Error('Mission schedule not found');
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
        return schedule;
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    // Final check before timeout
    const { data: schedule, error } = await this.adminClient
      .from('mission_schedules')
      .select('dtstart, until')
      .eq('id', missionScheduleId)
      .single();

    if (error) {
      throw new Error(`Timeout waiting for edge function: ${error.message}`);
    }

    if (!schedule) {
      throw new Error('Timeout: Mission schedule not found');
    }

    return schedule;
  }
}

export class TriggerTestCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  async cleanupFixture(fixture: TriggerTestFixture): Promise<void> {
    try {
      await this.adminClient
        .from('mission_schedules')
        .delete()
        .eq('id', fixture.missionScheduleId);

      await this.adminClient
        .from('missions')
        .delete()
        .eq('id', fixture.missionId);

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

  async createMissionWithRrule(rrule: string): Promise<TriggerTestFixture> {
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
      throw new Error(`Failed to create structure: ${structureError?.message}`);
    }

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

    const { data: membershipData, error: membershipError } =
      await this.adminClient
        .from('structure_members')
        .insert({
          professional_id: professionalId,
          structure_id: structureId,
        })
        .select('structure_id, professional_id')
        .single();

    if (membershipError || !membershipData) {
      throw new Error(
        `Failed to create membership: ${membershipError?.message}`
      );
    }

    // Create mission with date range
    const { data: missionData, error: missionError } = await this.adminClient
      .from('missions')
      .insert({
        description: 'Test mission description',
        mission_dtstart: '2024-01-01T00:00:00Z',
        mission_until: '2024-12-31T23:59:59Z',
        professional_id: professionalId,
        status: 'pending',
        structure_id: structureId,
        title: 'Test Mission',
      })
      .select('id')
      .single();

    if (missionError || !missionData) {
      throw new Error(`Failed to create mission: ${missionError?.message}`);
    }

    // Create mission_schedule with rrule
    const { data: scheduleData, error: scheduleError } = await this.adminClient
      .from('mission_schedules')
      .insert({
        duration_mn: 240,
        mission_id: missionData.id,
        rrule: rrule,
      })
      .select('id')
      .single();

    if (scheduleError || !scheduleData) {
      throw new Error(
        `Failed to create mission schedule: ${scheduleError?.message}`
      );
    }

    return {
      adminClient: this.adminClient,
      missionId: missionData.id,
      missionScheduleId: scheduleData.id,
      professionalId,
      structureId,
      supabaseClient: this.supabaseClient,
    };
  }
}
