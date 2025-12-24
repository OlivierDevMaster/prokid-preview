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

describe('Professionals RLS - DELETE', () => {
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

  it('should prevent unauthenticated users from deleting professional profiles', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('professionals')
      .delete()
      .eq('user_id', professional.professionalId!)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('professionals')
      .select('user_id')
      .eq('user_id', professional.professionalId!)
      .single();

    assertExists(stillExists);
  });

  it('should prevent professionals from deleting their own profile', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { data, error } = await authenticatedClient
      .from('professionals')
      .delete()
      .eq('user_id', professional.professionalId!)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('professionals')
      .select('user_id')
      .eq('user_id', professional.professionalId!)
      .single();

    assertExists(stillExists);
  });

  it("should prevent professionals from deleting other professionals' profiles", async () => {
    const professional1 = await fixtureBuilder.createOnboardedProfessional();
    const professional2 = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional1, professional2);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional1.token
    );
    const { data, error } = await authenticatedClient
      .from('professionals')
      .delete()
      .eq('user_id', professional2.professionalId!)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('professionals')
      .select('user_id')
      .eq('user_id', professional2.professionalId!)
      .single();

    assertExists(stillExists);
  });

  it('should allow admins to delete any professional profile', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(professional, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('professionals')
      .delete()
      .eq('user_id', professional.professionalId!)
      .select();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.length, 1);

    const { data: deleted } = await adminClient
      .from('professionals')
      .select('user_id')
      .eq('user_id', professional.professionalId!)
      .single();

    assertEquals(deleted, null);
  });
});
