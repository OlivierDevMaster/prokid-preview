import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface AvailabilityTestFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  availabilityId?: string;
  availabilityIds?: string[];
  email: string;
  professionalId?: string;
  supabaseClient: SupabaseTestClient;
  token: string;
  userId: string;
}

/**
 * Cleanup helper for availability fixtures
 */
export class AvailabilityCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  /**
   * Clean up an availability fixture
   */
  async cleanupFixture(fixture: AvailabilityTestFixture): Promise<void> {
    try {
      // Delete availabilities
      if (fixture.availabilityId) {
        await this.adminClient
          .from('availabilities')
          .delete()
          .eq('id', fixture.availabilityId);
      }

      // Delete all availabilities for the professional
      if (fixture.professionalId) {
        await this.adminClient
          .from('availabilities')
          .delete()
          .eq('user_id', fixture.professionalId);
      }

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

  /**
   * Clean up multiple availabilities
   */
  async cleanupMultipleAvailabilities(
    fixture: { availabilityIds: string[] } & AvailabilityTestFixture
  ): Promise<void> {
    try {
      // Delete specific availabilities
      for (const availabilityId of fixture.availabilityIds) {
        await this.adminClient
          .from('availabilities')
          .delete()
          .eq('id', availabilityId);
      }

      // Delete all availabilities for the professional
      if (fixture.professionalId) {
        await this.adminClient
          .from('availabilities')
          .delete()
          .eq('user_id', fixture.professionalId);
      }

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

export class AvailabilityFixtureBuilder {
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
  async createOnboardedProfessional(): Promise<AvailabilityTestFixture> {
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
          professional_email: email,
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
      adminClient: this.adminClient,
      email,
      professionalId: professionalData.user_id,
      supabaseClient: this.supabaseClient,
      token,
      userId,
    };
  }

  /**
   * Create a professional user with availability
   */
  async createProfessionalWithAvailability(): Promise<AvailabilityTestFixture> {
    const fixture = await this.createOnboardedProfessional();

    // Create a recurring availability (Monday 9am-12pm, 180 minutes)
    // Using RRULE format: DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO
    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;

    const { data: availabilityData, error: availabilityError } =
      await this.adminClient
        .from('availabilities')
        .insert({
          duration_mn: 180,
          rrule,
          user_id: fixture.professionalId!,
        })
        .select('id')
        .single();

    if (availabilityError || !availabilityData) {
      throw new Error(
        `Failed to create availability: ${availabilityError?.message}`
      );
    }

    fixture.availabilityId = availabilityData.id;

    return fixture;
  }

  /**
   * Create a professional user with multiple availabilities
   */
  async createProfessionalWithMultipleAvailabilities(): Promise<
    { availabilityIds: string[] } & AvailabilityTestFixture
  > {
    const fixture = await this.createOnboardedProfessional();

    // Create multiple availabilities
    const availabilities = [
      {
        duration_mn: 180,
        rrule: `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`,
        user_id: fixture.professionalId!,
      }, // Monday 9am-12pm
      {
        duration_mn: 240,
        rrule: `DTSTART:20250101T140000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`,
        user_id: fixture.professionalId!,
      }, // Monday 2pm-6pm
      {
        duration_mn: 360,
        rrule: `DTSTART:20250102T100000Z\nRRULE:FREQ=WEEKLY;BYDAY=TU`,
        user_id: fixture.professionalId!,
      }, // Tuesday 10am-4pm
    ];

    const { data: availabilityData, error: availabilityError } =
      await this.adminClient
        .from('availabilities')
        .insert(availabilities)
        .select('id');

    if (availabilityError || !availabilityData) {
      throw new Error(
        `Failed to create availabilities: ${availabilityError?.message}`
      );
    }

    const availabilityIds = availabilityData.map(a => a.id);

    return {
      ...fixture,
      availabilityIds,
    };
  }

  /**
   * Create a professional user without availabilities
   */
  async createProfessionalWithoutAvailabilities(): Promise<AvailabilityTestFixture> {
    return await this.createOnboardedProfessional();
  }
}
