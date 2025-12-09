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

describe('Structure Invitations RLS - UPDATE', () => {
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

  it('should allow professionals to accept invitations they received', async () => {
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
      .update({ status: 'accepted' })
      .eq('id', invitationData.id)
      .select('id, status')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.status, 'accepted');
  });

  it('should allow professionals to decline invitations they received', async () => {
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
      .update({ status: 'declined' })
      .eq('id', invitationData.id)
      .select('id, status')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.status, 'declined');
  });

  it('should prevent professionals from updating invitations they did not receive', async () => {
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
      .update({ status: 'accepted' })
      .eq('id', invitationData.id)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);
  });

  it('should prevent professionals from updating status to invalid values', async () => {
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
      .update({ status: 'pending' })
      .eq('id', invitationData.id)
      .select();

    assertEquals(data, null);
    assertExists(error);
  });

  it('should allow structures to update invitations they sent', async () => {
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
      .update({ status: 'declined' })
      .eq('id', invitationData.id)
      .select('id, status')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.status, 'declined');
  });

  it('should prevent structures from updating invitations they did not send', async () => {
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
      .update({ status: 'declined' })
      .eq('id', invitationData.id)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);
  });

  it('should allow admins to update any structure invitation', async () => {
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

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('structure_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationData.id)
      .select('id, status')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.status, 'accepted');
  });

  it('should prevent unauthenticated users from updating invitations', async () => {
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
      .update({ status: 'accepted' })
      .eq('id', invitationData.id)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);
  });

  it('should prevent professionals from changing accepted invitation back to pending', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'accepted',
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
      .update({ status: 'pending' })
      .eq('id', invitationData.id)
      .select();

    assertEquals(data, null);
    assertExists(error);

    // Verify the status was not changed
    const { data: verificationData } = await adminClient
      .from('structure_invitations')
      .select('status')
      .eq('id', invitationData.id)
      .single();

    assertExists(verificationData);
    assertEquals(verificationData.status, 'accepted');
  });

  it('should prevent professionals from changing declined invitation back to pending', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'declined',
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
      .update({ status: 'pending' })
      .eq('id', invitationData.id)
      .select();

    assertEquals(data, null);
    assertExists(error);

    // Verify the status was not changed
    const { data: verificationData } = await adminClient
      .from('structure_invitations')
      .select('status')
      .eq('id', invitationData.id)
      .single();

    assertExists(verificationData);
    assertEquals(verificationData.status, 'declined');
  });

  it('should prevent structures from changing accepted invitation back to pending', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'accepted',
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
      .update({ status: 'pending' })
      .eq('id', invitationData.id)
      .select();

    assertEquals(data, null);
    assertExists(error);

    // Verify the status was not changed
    const { data: verificationData } = await adminClient
      .from('structure_invitations')
      .select('status')
      .eq('id', invitationData.id)
      .single();

    assertExists(verificationData);
    assertEquals(verificationData.status, 'accepted');
  });

  it('should prevent structures from changing declined invitation back to pending', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'declined',
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
      .update({ status: 'pending' })
      .eq('id', invitationData.id)
      .select();

    assertEquals(data, null);
    assertExists(error);

    // Verify the status was not changed
    const { data: verificationData } = await adminClient
      .from('structure_invitations')
      .select('status')
      .eq('id', invitationData.id)
      .single();

    assertExists(verificationData);
    assertEquals(verificationData.status, 'declined');
  });

  it('should prevent admins from changing accepted invitation back to pending', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(structure, professional, admin);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'accepted',
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

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('structure_invitations')
      .update({ status: 'pending' })
      .eq('id', invitationData.id)
      .select();

    assertEquals(data, null);
    assertExists(error);

    // Verify the status was not changed
    const { data: verificationData } = await adminClient
      .from('structure_invitations')
      .select('status')
      .eq('id', invitationData.id)
      .single();

    assertExists(verificationData);
    assertEquals(verificationData.status, 'accepted');
  });

  it('should prevent admins from changing declined invitation back to pending', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(structure, professional, admin);

    const { data: invitationData, error: invitationError } = await adminClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'declined',
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

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('structure_invitations')
      .update({ status: 'pending' })
      .eq('id', invitationData.id)
      .select();

    assertEquals(data, null);
    assertExists(error);

    // Verify the status was not changed
    const { data: verificationData } = await adminClient
      .from('structure_invitations')
      .select('status')
      .eq('id', invitationData.id)
      .single();

    assertExists(verificationData);
    assertEquals(verificationData.status, 'declined');
  });
});
