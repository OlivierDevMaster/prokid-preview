import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface MissionTestFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  email: string;
  missionId?: string;
  missionIds?: string[]; // Track multiple missions for cleanup
  professionalId?: string;
  professionalToken?: string;
  structureId?: string;
  structureToken?: string;
  supabaseClient: SupabaseTestClient;
  userId: string;
}

/**
 * Cleanup helper for mission fixtures
 */
export class MissionCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  /**
   * Clean up a mission fixture
   */
  async cleanupFixture(fixture: MissionTestFixture): Promise<void> {
    try {
      // Collect all mission IDs to clean up
      const missionIdsToCleanup = new Set<string>();

      if (fixture.missionId) {
        missionIdsToCleanup.add(fixture.missionId);
      }

      if (fixture.missionIds) {
        fixture.missionIds.forEach(id => missionIdsToCleanup.add(id));
      }

      // Delete mission schedules for tracked missions
      for (const missionId of missionIdsToCleanup) {
        await this.adminClient
          .from('mission_schedules')
          .delete()
          .eq('mission_id', missionId);

        await this.adminClient.from('missions').delete().eq('id', missionId);
      }

      // Delete all missions for the professional (fallback cleanup)
      if (fixture.professionalId) {
        const { data: missions } = await this.adminClient
          .from('missions')
          .select('id')
          .eq('professional_id', fixture.professionalId);

        if (missions && missions.length > 0) {
          for (const mission of missions) {
            await this.adminClient
              .from('mission_schedules')
              .delete()
              .eq('mission_id', mission.id);
          }
          await this.adminClient
            .from('missions')
            .delete()
            .eq('professional_id', fixture.professionalId);
        }
      }

      // Delete structure memberships
      if (fixture.structureId && fixture.professionalId) {
        await this.adminClient
          .from('structure_members')
          .delete()
          .eq('structure_id', fixture.structureId)
          .eq('professional_id', fixture.professionalId);
      }

      // Delete structure invitations
      if (fixture.structureId && fixture.professionalId) {
        await this.adminClient
          .from('structure_invitations')
          .delete()
          .eq('structure_id', fixture.structureId)
          .eq('professional_id', fixture.professionalId);
      }

      // Delete structure if exists
      if (fixture.structureId) {
        await this.adminClient
          .from('structures')
          .delete()
          .eq('user_id', fixture.structureId);
      }

      // Delete professional if exists
      if (fixture.professionalId) {
        await this.adminClient
          .from('professionals')
          .delete()
          .eq('user_id', fixture.professionalId);
      }

      // Delete profiles
      if (fixture.professionalId) {
        await this.adminClient
          .from('profiles')
          .delete()
          .eq('user_id', fixture.professionalId);
      }

      if (fixture.structureId) {
        await this.adminClient
          .from('profiles')
          .delete()
          .eq('user_id', fixture.structureId);
      }

      // Delete users
      if (fixture.professionalId) {
        await this.adminClient.auth.admin.deleteUser(fixture.professionalId);
      }

      if (
        fixture.structureId &&
        fixture.structureId !== fixture.professionalId
      ) {
        await this.adminClient.auth.admin.deleteUser(fixture.structureId);
      }
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }
}

/**
 * Helper to wait for async edge functions to complete
 * Used for waiting on triggers that populate fields asynchronously
 */
export class MissionEdgeFunctionLatencyHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  /**
   * Waits for the edge function to complete by polling the database.
   * The edge function updates dtstart and until fields asynchronously.
   * Since the trigger initially sets both to NULL and the edge function updates them,
   * we poll until enough time has passed for the edge function to complete.
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

export class MissionFixtureBuilder {
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
   * Create an onboarded professional user
   */
  async createOnboardedProfessional(): Promise<{
    professionalId: string;
    professionalToken: string;
    userId: string;
  }> {
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

    // Update profile to mark as onboarded
    await this.adminClient
      .from('profiles')
      .update({ is_onboarded: true })
      .eq('user_id', userId);

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
      professionalId: professionalData.user_id,
      professionalToken: token,
      userId,
    };
  }

  /**
   * Create an onboarded structure user
   */
  async createOnboardedStructure(): Promise<{
    structureId: string;
    structureToken: string;
    userId: string;
  }> {
    const email = `test-structure-${Date.now()}@example.com`;

    // Create a test user with structure role
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

    // Wait a bit for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create structure record
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

    // Update profile to mark as onboarded
    await this.adminClient
      .from('profiles')
      .update({ is_onboarded: true })
      .eq('user_id', userId);

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
      structureId: structureData.user_id,
      structureToken: token,
      userId,
    };
  }

  /**
   * Create a structure and professional without membership
   */
  async createStructureWithoutProfessionalMember(): Promise<MissionTestFixture> {
    const structure = await this.createOnboardedStructure();
    const professional = await this.createOnboardedProfessional();

    return {
      adminClient: this.adminClient,
      email: professional.userId,
      professionalId: professional.professionalId,
      professionalToken: professional.professionalToken,
      structureId: structure.structureId,
      structureToken: structure.structureToken,
      supabaseClient: this.supabaseClient,
      userId: professional.userId,
    };
  }

  /**
   * Create a structure and professional with membership
   */
  async createStructureWithProfessionalMember(): Promise<MissionTestFixture> {
    const structure = await this.createOnboardedStructure();
    const professional = await this.createOnboardedProfessional();

    // Create structure invitation (as pending first)
    const { data: invitationData, error: invitationError } =
      await this.adminClient
        .from('structure_invitations')
        .insert({
          professional_id: professional.professionalId,
          status: 'pending',
          structure_id: structure.structureId,
        })
        .select('id')
        .single();

    if (invitationError || !invitationData) {
      throw new Error(
        `Failed to create invitation: ${invitationError?.message}`
      );
    }

    // Update invitation to accepted (this will trigger the membership creation)
    const { error: updateError } = await this.adminClient
      .from('structure_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationData.id);

    if (updateError) {
      throw new Error(`Failed to accept invitation: ${updateError?.message}`);
    }

    // Wait a bit for the trigger to create the membership
    await new Promise(resolve => setTimeout(resolve, 200));

    // Verify membership was created (or create it manually if trigger didn't fire)
    const { data: membership, error: membershipError } = await this.adminClient
      .from('structure_members')
      .select('id')
      .eq('structure_id', structure.structureId)
      .eq('professional_id', professional.professionalId)
      .is('deleted_at', null)
      .maybeSingle();

    if (membershipError) {
      throw new Error(
        `Failed to check membership: ${membershipError?.message}`
      );
    }

    // If membership doesn't exist, create it manually (admin can do this)
    if (!membership) {
      const { error: createMembershipError } = await this.adminClient
        .from('structure_members')
        .insert({
          professional_id: professional.professionalId,
          structure_id: structure.structureId,
        });

      if (createMembershipError) {
        throw new Error(
          `Failed to create membership: ${createMembershipError?.message}`
        );
      }
    }

    return {
      adminClient: this.adminClient,
      email: professional.userId,
      professionalId: professional.professionalId,
      professionalToken: professional.professionalToken,
      structureId: structure.structureId,
      structureToken: structure.structureToken,
      supabaseClient: this.supabaseClient,
      userId: professional.userId,
    };
  }
}
