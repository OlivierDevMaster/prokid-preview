import { createClient } from '@supabase/supabase-js';

import { Database } from '../../../../types/database/schema.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';

export interface TriggerTestFixture {
  adminClient: ReturnType<typeof createClient<Database>>;
  missionId?: string;
  professionalId: string;
  professionalToken?: string;
  reportId?: string;
  structureId: string;
  supabaseClient: SupabaseTestClient;
}

export class TriggerTestCleanupHelper {
  constructor(private adminClient: ReturnType<typeof createClient<Database>>) {}

  async cleanupFixture(fixture: TriggerTestFixture): Promise<void> {
    try {
      if (fixture?.reportId) {
        await this.adminClient
          .from('reports')
          .delete()
          .eq('id', fixture.reportId);
      }

      if (fixture?.missionId) {
        await this.adminClient
          .from('missions')
          .delete()
          .eq('id', fixture.missionId);
      }

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

  async createMissionWithDifferentProfessional(): Promise<TriggerTestFixture> {
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
        .select('id')
        .single();

    if (membershipError || !membershipData) {
      throw new Error(
        `Failed to create membership: ${membershipError?.message}`
      );
    }

    const rrule = `DTSTART:20240101T100000Z
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`;

    const { data: missionData, error: missionError } = await this.adminClient
      .from('missions')
      .insert({
        description: 'Test mission description',
        duration_mn: 240,
        professional_id: professionalId,
        rrule: rrule,
        status: 'pending',
        structure_id: structureId,
        title: 'Test Mission',
      })
      .select('id')
      .single();

    if (missionError || !missionData) {
      throw new Error(`Failed to create mission: ${missionError?.message}`);
    }

    const authClient =
      this.supabaseClient.createAuthenticatedClient('dummy-token');

    const { data: signInData } = await authClient.auth.signInWithPassword({
      email: professionalEmail,
      password: 'testpassword123',
    });

    return {
      adminClient: this.adminClient,
      missionId: missionData.id,
      professionalId,
      professionalToken: signInData?.session?.access_token,
      structureId,
      supabaseClient: this.supabaseClient,
    };
  }

  async createMissionWithProfessional(): Promise<TriggerTestFixture> {
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
        .select('id')
        .single();

    if (membershipError || !membershipData) {
      throw new Error(
        `Failed to create membership: ${membershipError?.message}`
      );
    }

    const rrule = `DTSTART:20240101T100000Z
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`;

    const { data: missionData, error: missionError } = await this.adminClient
      .from('missions')
      .insert({
        description: 'Test mission description',
        duration_mn: 240,
        professional_id: professionalId,
        rrule: rrule,
        status: 'pending',
        structure_id: structureId,
        title: 'Test Mission',
      })
      .select('id')
      .single();

    if (missionError || !missionData) {
      throw new Error(`Failed to create mission: ${missionError?.message}`);
    }

    const authClient =
      this.supabaseClient.createAuthenticatedClient('dummy-token');

    const { data: signInData } = await authClient.auth.signInWithPassword({
      email: professionalEmail,
      password: 'testpassword123',
    });

    return {
      adminClient: this.adminClient,
      missionId: missionData.id,
      professionalId,
      professionalToken: signInData?.session?.access_token,
      structureId,
      supabaseClient: this.supabaseClient,
    };
  }

  async createProfessional(): Promise<TriggerTestFixture> {
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

    const authClient =
      this.supabaseClient.createAuthenticatedClient('dummy-token');

    const { data: signInData } = await authClient.auth.signInWithPassword({
      email: professionalEmail,
      password: 'testpassword123',
    });

    return {
      adminClient: this.adminClient,
      professionalId,
      professionalToken: signInData?.session?.access_token,
      structureId,
      supabaseClient: this.supabaseClient,
    };
  }

  async createReport(): Promise<TriggerTestFixture> {
    const fixture = await this.createMissionWithProfessional();

    const { data: reportData, error: reportError } = await this.adminClient
      .from('reports')
      .insert({
        author_id: fixture.professionalId,
        content: 'Test report content',
        mission_id: fixture.missionId,
        status: 'draft',
        title: 'Test Report',
      })
      .select('id')
      .single();

    if (reportError || !reportData) {
      throw new Error(`Failed to create report: ${reportError?.message}`);
    }

    return {
      ...fixture,
      reportId: reportData.id,
    };
  }
}
