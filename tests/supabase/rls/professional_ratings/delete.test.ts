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

describe('Professional Ratings RLS - DELETE', () => {
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

  it('should prevent unauthenticated users from deleting ratings', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure.structureId!
    );

    const { data: rating } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure.structureId!,
      })
      .select('id')
      .single();

    assertExists(rating);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('professional_ratings')
      .delete()
      .eq('id', rating.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('professional_ratings')
      .select('id')
      .eq('id', rating.id)
      .single();

    assertExists(stillExists);
  });

  it('should allow structures to delete their own ratings', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure.structureId!
    );

    const { data: rating } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure.structureId!,
      })
      .select('id')
      .single();

    assertExists(rating);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure.token
    );
    const { error } = await structureClient
      .from('professional_ratings')
      .delete()
      .eq('id', rating.id);

    assertEquals(error, null);

    const { data: deletedRating } = await adminClient
      .from('professional_ratings')
      .select('id')
      .eq('id', rating.id)
      .single();

    assertEquals(deletedRating, null);
  });

  it('should prevent structures from deleting ratings created by other structures', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure1 = await fixtureBuilder.createOnboardedStructure();
    const structure2 = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure1, structure2);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure1.structureId!
    );

    const { data: rating } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure1.structureId!,
      })
      .select('id')
      .single();

    assertExists(rating);

    const structure2Client = supabaseClient.createAuthenticatedClient(
      structure2.token
    );
    const { data, error } = await structure2Client
      .from('professional_ratings')
      .delete()
      .eq('id', rating.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('professional_ratings')
      .select('id')
      .eq('id', rating.id)
      .single();

    assertExists(stillExists);
  });

  it('should prevent professionals from deleting ratings', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure.structureId!
    );

    const { data: rating } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure.structureId!,
      })
      .select('id')
      .single();

    assertExists(rating);

    const professionalClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { data, error } = await professionalClient
      .from('professional_ratings')
      .delete()
      .eq('id', rating.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('professional_ratings')
      .select('id')
      .eq('id', rating.id)
      .single();

    assertExists(stillExists);
  });

  it('should allow admins to delete all ratings', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(professional, structure, admin);

    const membershipId = await fixtureBuilder.createActiveMembership(
      professional.professionalId!,
      structure.structureId!
    );

    const { data: rating } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: membershipId,
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure.structureId!,
      })
      .select('id')
      .single();

    assertExists(rating);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { error } = await adminAuthClient
      .from('professional_ratings')
      .delete()
      .eq('id', rating.id);

    assertEquals(error, null);

    const { data: deletedRating } = await adminClient
      .from('professional_ratings')
      .select('id')
      .eq('id', rating.id)
      .single();

    assertEquals(deletedRating, null);
  });
});
