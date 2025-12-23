import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  ProfessionalRatingsRlsCleanupHelper,
  ProfessionalRatingsRlsFixtureBuilder,
  ProfessionalRlsFixture,
  StructureRlsFixture,
} from './professional_ratings.fixture.ts';

describe('Professional Ratings RLS - INSERT', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: ProfessionalRatingsRlsFixtureBuilder;
  let cleanupHelper: ProfessionalRatingsRlsCleanupHelper;
  let fixtures: Array<
    AdminRlsFixture | ProfessionalRlsFixture | StructureRlsFixture
  > = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new ProfessionalRatingsRlsFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new ProfessionalRatingsRlsCleanupHelper(adminClient);
  });

  afterEach(async () => {
    for (const fixture of fixtures) {
      if ('professionalId' in fixture) {
        await cleanupHelper.cleanupProfessional(
          fixture as ProfessionalRlsFixture
        );
      } else if ('structureId' in fixture) {
        await cleanupHelper.cleanupStructure(fixture as StructureRlsFixture);
      } else {
        await cleanupHelper.cleanupAdmin(fixture as AdminRlsFixture);
      }
    }
    fixtures = [];
  });

  it('should prevent unauthenticated users from creating ratings', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure.structureId!
    );

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure.structureId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow structures to create ratings for their active members', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure.structureId!
    );

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure.token
    );
    const { data, error } = await structureClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure.structureId!,
      })
      .select('id, structure_id, professional_id, rating')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.structure_id, structure.structureId);
    assertEquals(data.professional_id, professional.professionalId);
    assertEquals(data.rating, 4.5);
  });

  it('should prevent structures from creating ratings for inactive members', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure.structureId!
    );

    // Soft delete the membership
    await adminClient
      .from('structure_members')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', membershipId);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure.token
    );
    const { data, error } = await structureClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure.structureId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should prevent structures from creating ratings for members of other structures', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure1 = await fixtureBuilder.createOnboardedStructure();
    const structure2 = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure1, structure2);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure1.structureId!
    );

    const structure2Client = supabaseClient.createAuthenticatedClient(
      structure2.token
    );
    const { data, error } = await structure2Client
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure1.structureId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should prevent professionals from creating ratings', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure.structureId!
    );

    const professionalClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { data, error } = await professionalClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure.structureId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should prevent admins from creating ratings', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(professional, structure, admin);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure.structureId!
    );

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure.structureId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });
});
