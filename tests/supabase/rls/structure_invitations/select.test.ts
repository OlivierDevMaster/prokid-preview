import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  ProfessionalRlsFixture,
  StructureInvitationRlsCleanupHelper,
  StructureInvitationRlsFixtureBuilder,
  StructureRlsFixture,
} from './structure_invitations.fixture.ts';

describe('Structure Invitations RLS - SELECT', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: StructureInvitationRlsFixtureBuilder;
  let cleanupHelper: StructureInvitationRlsCleanupHelper;
  let fixtures: Array<
    AdminRlsFixture | ProfessionalRlsFixture | StructureRlsFixture
  > = [];
  let invitationIds: string[] = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new StructureInvitationRlsFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new StructureInvitationRlsCleanupHelper(adminClient);
  });

  afterEach(async () => {
    for (const invitationId of invitationIds) {
      await cleanupHelper.cleanupInvitation(invitationId);
    }
    invitationIds = [];

    for (const fixture of fixtures) {
      if ('structureId' in fixture) {
        await cleanupHelper.cleanupStructure(fixture as StructureRlsFixture);
      } else if ('professionalId' in fixture) {
        await cleanupHelper.cleanupProfessional(
          fixture as ProfessionalRlsFixture
        );
      } else {
        await cleanupHelper.cleanupAdmin(fixture as AdminRlsFixture);
      }
    }
    fixtures = [];
  });

  it('should allow structures to view invitations they sent', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'pending',
        structure_id: structure.structureId!,
      })
      .select('id')
      .single();

    if (invitationError || !invitationData) {
      throw new Error(
        `Failed to create test invitation: ${invitationError?.message}`
      );
    }
    invitationIds.push(invitationData.id);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure.token
    );
    const { data, error } = await structureClient
      .from('structure_invitations')
      .select('*')
      .eq('id', invitationData.id)
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.structure_id, structure.structureId);
    assertEquals(data.professional_id, professional.professionalId);
  });

  it('should allow professionals to view invitations they received', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'pending',
        structure_id: structure.structureId!,
      })
      .select('id')
      .single();

    if (invitationError || !invitationData) {
      throw new Error(
        `Failed to create test invitation: ${invitationError?.message}`
      );
    }
    invitationIds.push(invitationData.id);

    const professionalClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { data, error } = await professionalClient
      .from('structure_invitations')
      .select('*')
      .eq('id', invitationData.id)
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.structure_id, structure.structureId);
    assertEquals(data.professional_id, professional.professionalId);
  });

  it('should prevent structures from viewing invitations they did not send', async () => {
    const structure1 = await fixtureBuilder.createOnboardedStructure();
    const structure2 = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure1, structure2, professional);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'pending',
        structure_id: structure1.structureId!,
      })
      .select('id')
      .single();

    if (invitationError || !invitationData) {
      throw new Error(
        `Failed to create test invitation: ${invitationError?.message}`
      );
    }
    invitationIds.push(invitationData.id);

    const structure2Client = supabaseClient.createAuthenticatedClient(
      structure2.token
    );
    const { data, error } = await structure2Client
      .from('structure_invitations')
      .select('*')
      .eq('id', invitationData.id)
      .single();

    assertEquals(data, null);
    assertExists(error);
  });

  it('should prevent professionals from viewing invitations they did not receive', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional1 = await fixtureBuilder.createOnboardedProfessional();
    const professional2 = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional1, professional2);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional1.professionalId!,
        status: 'pending',
        structure_id: structure.structureId!,
      })
      .select('id')
      .single();

    if (invitationError || !invitationData) {
      throw new Error(
        `Failed to create test invitation: ${invitationError?.message}`
      );
    }
    invitationIds.push(invitationData.id);

    const professional2Client = supabaseClient.createAuthenticatedClient(
      professional2.token
    );
    const { data, error } = await professional2Client
      .from('structure_invitations')
      .select('*')
      .eq('id', invitationData.id)
      .single();

    assertEquals(data, null);
    assertExists(error);
  });

  it('should allow admins to view all structure invitations', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(structure, professional, admin);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'pending',
        structure_id: structure.structureId!,
      })
      .select('id')
      .single();

    if (invitationError || !invitationData) {
      throw new Error(
        `Failed to create test invitation: ${invitationError?.message}`
      );
    }
    invitationIds.push(invitationData.id);

    const adminAuthenticatedClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthenticatedClient
      .from('structure_invitations')
      .select('*')
      .eq('id', invitationData.id)
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.structure_id, structure.structureId);
    assertEquals(data.professional_id, professional.professionalId);
  });

  it('should prevent unauthenticated users from viewing structure invitations', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'pending',
        structure_id: structure.structureId!,
      })
      .select('id')
      .single();

    if (invitationError || !invitationData) {
      throw new Error(
        `Failed to create test invitation: ${invitationError?.message}`
      );
    }
    invitationIds.push(invitationData.id);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('structure_invitations')
      .select('*')
      .eq('id', invitationData.id)
      .single();

    assertEquals(data, null);
    assertExists(error);
  });
});
