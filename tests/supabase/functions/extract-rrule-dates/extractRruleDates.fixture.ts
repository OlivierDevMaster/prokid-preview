import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface ExtractRruleDatesTestFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  availabilityId?: string;
  missionId?: string;
  missionScheduleId?: string;
  professionalId?: string;
  structureId?: string;
  supabaseClient: SupabaseTestClient;
  userId?: string;
}

/**
 * Cleanup helper for extract-rrule-dates fixtures
 */
export class ExtractRruleDatesCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  /**
   * Clean up a fixture
   */
  async cleanupFixture(fixture: ExtractRruleDatesTestFixture): Promise<void> {
    try {
      // Delete mission schedule
      if (fixture.missionScheduleId) {
        await this.adminClient
          .from('mission_schedules')
          .delete()
          .eq('id', fixture.missionScheduleId);
      }

      // Delete mission
      if (fixture.missionId) {
        await this.adminClient
          .from('missions')
          .delete()
          .eq('id', fixture.missionId);
      }

      // Delete availability
      if (fixture.availabilityId) {
        await this.adminClient
          .from('availabilities')
          .delete()
          .eq('id', fixture.availabilityId);
      }

      // Delete structure memberships
      if (fixture.structureId && fixture.professionalId) {
        await this.adminClient
          .from('structure_members')
          .delete()
          .eq('structure_id', fixture.structureId)
          .eq('professional_id', fixture.professionalId);
      }

      // Delete professional
      if (fixture.professionalId) {
        await this.adminClient
          .from('professionals')
          .delete()
          .eq('user_id', fixture.professionalId);
      }

      // Delete structure
      if (fixture.structureId) {
        await this.adminClient
          .from('structures')
          .delete()
          .eq('user_id', fixture.structureId);

        // Delete structure profile
        await this.adminClient
          .from('profiles')
          .delete()
          .eq('user_id', fixture.structureId);

        // Delete structure user
        await this.adminClient.auth.admin.deleteUser(fixture.structureId);
      }

      // Delete profile
      if (fixture.userId) {
        await this.adminClient
          .from('profiles')
          .delete()
          .eq('user_id', fixture.userId);
      }

      // Delete user
      if (fixture.userId) {
        await this.adminClient.auth.admin.deleteUser(fixture.userId);
      }
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }
}

export class ExtractRruleDatesFixtureBuilder {
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
   * Create an availability with RRULE
   */
  async createAvailabilityWithRrule(
    rrule: string
  ): Promise<ExtractRruleDatesTestFixture> {
    // Create professional user
    const email = `test-professional-${Date.now()}@example.com`;
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

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create professional
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
          user_id: userId,
        })
        .select('user_id')
        .single();

    if (professionalError || !professionalData) {
      throw new Error(
        `Failed to create professional: ${professionalError?.message}`
      );
    }

    // Create availability
    const { data: availabilityData, error: availabilityError } =
      await this.adminClient
        .from('availabilities')
        .insert({
          duration_mn: 180,
          rrule,
          user_id: professionalData.user_id,
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
      professionalId: professionalData.user_id,
      supabaseClient: this.supabaseClient,
      userId,
    };
  }

  /**
   * Create a mission schedule without RRULE (null rrule)
   */
  async createMissionScheduleWithoutRrule(): Promise<ExtractRruleDatesTestFixture> {
    // Create structure user
    const structureEmail = `test-structure-${Date.now()}@example.com`;
    const { data: structureAuthData, error: structureAuthError } =
      await this.adminClient.auth.admin.createUser({
        email: structureEmail,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: {
          first_name: 'Test',
          last_name: 'Structure',
          role: 'structure',
        },
      });

    if (structureAuthError || !structureAuthData.user) {
      throw new Error(
        `Failed to create structure user: ${structureAuthError?.message}`
      );
    }

    const structureUserId = structureAuthData.user.id;

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create structure record
    const { data: structureData, error: structureError } =
      await this.adminClient
        .from('structures')
        .insert({
          name: 'Test Structure',
          user_id: structureUserId,
        })
        .select('user_id')
        .single();

    if (structureError || !structureData) {
      throw new Error(`Failed to create structure: ${structureError?.message}`);
    }

    // Create professional user
    const email = `test-professional-${Date.now()}@example.com`;
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

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create professional
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
          user_id: userId,
        })
        .select('user_id')
        .single();

    if (professionalError || !professionalData) {
      throw new Error(
        `Failed to create professional: ${professionalError?.message}`
      );
    }

    // Create structure membership (required for mission creation)
    const { error: membershipError } = await this.adminClient
      .from('structure_members')
      .insert({
        professional_id: professionalData.user_id,
        structure_id: structureData.user_id,
      });

    if (membershipError) {
      throw new Error(
        `Failed to create structure membership: ${membershipError?.message}`
      );
    }

    // Create mission
    const { data: missionData, error: missionError } = await this.adminClient
      .from('missions')
      .insert({
        description: 'Test mission',
        mission_dtstart: '2025-01-01T00:00:00Z',
        mission_until: '2025-12-31T23:59:59Z',
        professional_id: professionalData.user_id,
        status: 'pending',
        structure_id: structureData.user_id,
        title: 'Test Mission',
      })
      .select('id')
      .single();

    if (missionError || !missionData) {
      throw new Error(`Failed to create mission: ${missionError?.message}`);
    }

    // Create mission schedule - we'll test null rrule by directly querying
    // a record that doesn't have rrule (though this shouldn't happen due to NOT NULL constraint)
    // Instead, we'll create a schedule and then test the edge case differently
    const { data: scheduleData, error: scheduleError } = await this.adminClient
      .from('mission_schedules')
      .insert({
        duration_mn: 120,
        mission_id: missionData.id,
        rrule: 'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
      })
      .select('id')
      .single();

    if (scheduleError || !scheduleData) {
      throw new Error(
        `Failed to create mission schedule: ${scheduleError?.message}`
      );
    }

    // Note: We can't actually set rrule to null due to NOT NULL constraint
    // The handler checks for !record.rrule which would catch empty strings
    // We'll test this by updating the rrule to an empty string in the test

    return {
      adminClient: this.adminClient,
      missionId: missionData.id,
      missionScheduleId: scheduleData.id,
      professionalId: professionalData.user_id,
      structureId: structureData.user_id,
      supabaseClient: this.supabaseClient,
      userId,
    };
  }

  /**
   * Create a mission schedule with RRULE
   */
  async createMissionScheduleWithRrule(
    rrule: string
  ): Promise<ExtractRruleDatesTestFixture> {
    // Create structure user
    const structureEmail = `test-structure-${Date.now()}@example.com`;
    const { data: structureAuthData, error: structureAuthError } =
      await this.adminClient.auth.admin.createUser({
        email: structureEmail,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: {
          first_name: 'Test',
          last_name: 'Structure',
          role: 'structure',
        },
      });

    if (structureAuthError || !structureAuthData.user) {
      throw new Error(
        `Failed to create structure user: ${structureAuthError?.message}`
      );
    }

    const structureUserId = structureAuthData.user.id;

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create structure record
    const { data: structureData, error: structureError } =
      await this.adminClient
        .from('structures')
        .insert({
          name: 'Test Structure',
          user_id: structureUserId,
        })
        .select('user_id')
        .single();

    if (structureError || !structureData) {
      throw new Error(`Failed to create structure: ${structureError?.message}`);
    }

    // Create professional user
    const email = `test-professional-${Date.now()}@example.com`;
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

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create professional
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
          user_id: userId,
        })
        .select('user_id')
        .single();

    if (professionalError || !professionalData) {
      throw new Error(
        `Failed to create professional: ${professionalError?.message}`
      );
    }

    // Create structure membership (required for mission creation)
    const { error: membershipError } = await this.adminClient
      .from('structure_members')
      .insert({
        professional_id: professionalData.user_id,
        structure_id: structureData.user_id,
      });

    if (membershipError) {
      throw new Error(
        `Failed to create structure membership: ${membershipError?.message}`
      );
    }

    // Create mission
    const { data: missionData, error: missionError } = await this.adminClient
      .from('missions')
      .insert({
        description: 'Test mission',
        mission_dtstart: '2025-01-01T00:00:00Z',
        mission_until: '2025-12-31T23:59:59Z',
        professional_id: professionalData.user_id,
        status: 'pending',
        structure_id: structureData.user_id,
        title: 'Test Mission',
      })
      .select('id')
      .single();

    if (missionError || !missionData) {
      throw new Error(`Failed to create mission: ${missionError?.message}`);
    }

    // Create mission schedule
    const { data: scheduleData, error: scheduleError } = await this.adminClient
      .from('mission_schedules')
      .insert({
        duration_mn: 120,
        mission_id: missionData.id,
        rrule,
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
      professionalId: professionalData.user_id,
      structureId: structureData.user_id,
      supabaseClient: this.supabaseClient,
      userId,
    };
  }
}
