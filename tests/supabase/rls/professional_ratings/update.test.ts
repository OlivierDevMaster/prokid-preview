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

describe('Professional Ratings RLS - UPDATE', () => {
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

  it('should prevent unauthenticated users from updating ratings', async () => {
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
      .update({ rating: 5.0 })
      .eq('id', rating.id)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);

    const { data: verifyData } = await adminClient
      .from('professional_ratings')
      .select('rating, comment')
      .eq('id', rating.id)
      .single();

    assertEquals(verifyData?.rating, 4.5);
    assertEquals(verifyData?.comment, 'Test comment');
  });

  it('should allow structures to update their own ratings', async () => {
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
    const { data, error } = await structureClient
      .from('professional_ratings')
      .update({ comment: 'Updated comment', rating: 5.0 })
      .eq('id', rating.id)
      .select('id, rating, comment')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.id, rating.id);
    assertEquals(data.rating, 5.0);
    assertEquals(data.comment, 'Updated comment');
  });

  it('should prevent structures from updating ratings created by other structures', async () => {
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
      .update({ rating: 5.0 })
      .eq('id', rating.id)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);

    const { data: verifyData } = await adminClient
      .from('professional_ratings')
      .select('rating, comment')
      .eq('id', rating.id)
      .single();

    assertEquals(verifyData?.rating, 4.5);
    assertEquals(verifyData?.comment, 'Test comment');
  });

  it('should prevent professionals from updating ratings', async () => {
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
      .update({ rating: 5.0 })
      .eq('id', rating.id)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);

    const { data: verifyData } = await adminClient
      .from('professional_ratings')
      .select('rating, comment')
      .eq('id', rating.id)
      .single();

    assertEquals(verifyData?.rating, 4.5);
    assertEquals(verifyData?.comment, 'Test comment');
  });

  it('should allow admins to update all ratings', async () => {
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
    const { data, error } = await adminAuthClient
      .from('professional_ratings')
      .update({ comment: 'Admin updated', rating: 5.0 })
      .eq('id', rating.id)
      .select('id, rating, comment')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.id, rating.id);
    assertEquals(data.rating, 5.0);
    assertEquals(data.comment, 'Admin updated');
  });
});
