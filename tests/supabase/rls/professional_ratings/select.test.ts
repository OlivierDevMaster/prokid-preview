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

describe('Professional Ratings RLS - SELECT', () => {
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

  it('should allow unauthenticated users to view all ratings', async () => {
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
      .select('*')
      .eq('id', rating.id);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].id, rating.id);
  });

  it('should allow authenticated users to view all ratings', async () => {
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
        professional_id: professional.professionalId!,
        rating: 4.5,
        structure_id: structure.structureId!,
      })
      .select('id')
      .single();

    assertExists(rating);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { data, error } = await authenticatedClient
      .from('professional_ratings')
      .select('*')
      .eq('id', rating.id);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].id, rating.id);
  });

  it('should allow structures to view ratings for their members', async () => {
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
      .select('*')
      .eq('id', rating.id);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].id, rating.id);
  });

  it('should allow professionals to view ratings about themselves', async () => {
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
      .select('*')
      .eq('id', rating.id);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].id, rating.id);
  });

  it('should allow admins to view all ratings', async () => {
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
      .select('*')
      .eq('id', rating.id);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].id, rating.id);
  });
});
