import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  ProfessionalRlsCleanupHelper,
  ProfessionalRlsFixture,
  ProfessionalRlsFixtureBuilder,
} from './professionals.fixture.ts';

describe('Professionals RLS - UPDATE', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: ProfessionalRlsFixtureBuilder;
  let cleanupHelper: ProfessionalRlsCleanupHelper;
  let fixtures: Array<AdminRlsFixture | ProfessionalRlsFixture> = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new ProfessionalRlsFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new ProfessionalRlsCleanupHelper(adminClient);
  });

  afterEach(async () => {
    for (const fixture of fixtures) {
      if ('professionalId' in fixture) {
        await cleanupHelper.cleanupProfessional(
          fixture as ProfessionalRlsFixture
        );
      } else {
        await cleanupHelper.cleanupAdmin(fixture as AdminRlsFixture);
      }
    }
    fixtures = [];
  });

  it('should prevent unauthenticated users from updating professional profiles', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional);

    const { data: originalData } = await adminClient
      .from('professionals')
      .select('city')
      .eq('user_id', professional.professionalId!)
      .single();

    assertExists(originalData);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('professionals')
      .update({ city: 'Lyon' })
      .eq('user_id', professional.professionalId!)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);

    const { data: verifyData } = await adminClient
      .from('professionals')
      .select('city')
      .eq('user_id', professional.professionalId!)
      .single();

    assertEquals(verifyData?.city, originalData.city);
  });

  it('should allow professionals to update their own profile', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { data, error } = await authenticatedClient
      .from('professionals')
      .update({ city: 'Lyon', description: 'Updated description' })
      .eq('user_id', professional.professionalId!)
      .select('city, description')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.city, 'Lyon');
    assertEquals(data.description, 'Updated description');
  });

  it("should prevent professionals from updating other professionals' profiles", async () => {
    const professional1 = await fixtureBuilder.createOnboardedProfessional();
    const professional2 = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional1, professional2);

    const { data: originalData } = await adminClient
      .from('professionals')
      .select('city')
      .eq('user_id', professional2.professionalId!)
      .single();

    assertExists(originalData);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional1.token
    );
    const { data, error } = await authenticatedClient
      .from('professionals')
      .update({ city: 'Lyon' })
      .eq('user_id', professional2.professionalId!)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);

    const { data: verifyData } = await adminClient
      .from('professionals')
      .select('city')
      .eq('user_id', professional2.professionalId!)
      .single();

    assertEquals(verifyData?.city, originalData.city);
  });

  it('should allow admins to update any professional profile', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(professional, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('professionals')
      .update({ city: 'Lyon', description: 'Admin updated description' })
      .eq('user_id', professional.professionalId!)
      .select('city, description')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.city, 'Lyon');
    assertEquals(data.description, 'Admin updated description');
  });
});
