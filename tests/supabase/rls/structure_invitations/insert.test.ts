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

describe('Structure Invitations RLS - INSERT', () => {
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

  it('should allow structures to create invitations to professionals', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure.token
    );
    const { data, error } = await structureClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'pending',
        structure_id: structure.structureId!,
      })
      .select('id, structure_id, professional_id, status')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.structure_id, structure.structureId);
    assertEquals(data.professional_id, professional.professionalId);
    assertEquals(data.status, 'pending');

    if (data.id) {
      invitationIds.push(data.id);
    }
  });

  it('should prevent structures from creating invitations for other structures', async () => {
    const structure1 = await fixtureBuilder.createOnboardedStructure();
    const structure2 = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure1, structure2, professional);

    const structure1Client = supabaseClient.createAuthenticatedClient(
      structure1.token
    );
    const { data, error } = await structure1Client
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'pending',
        structure_id: structure2.structureId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should prevent professionals from creating invitations', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional);

    const professionalClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { data, error } = await professionalClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'pending',
        structure_id: structure.structureId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should prevent unauthenticated users from creating invitations', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(structure, professional);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'pending',
        structure_id: structure.structureId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow admins to create structure invitations', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(structure, professional, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('structure_invitations')
      .insert({
        professional_id: professional.professionalId!,
        status: 'pending',
        structure_id: structure.structureId!,
      })
      .select('id, structure_id, professional_id, status')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.structure_id, structure.structureId);
    assertEquals(data.professional_id, professional.professionalId);
    assertEquals(data.status, 'pending');

    if (data.id) {
      invitationIds.push(data.id);
    }
  });
});
