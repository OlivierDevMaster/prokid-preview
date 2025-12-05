import { assertEquals } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  ProfessionalRlsCleanupHelper,
  ProfessionalRlsFixture,
  ProfessionalRlsFixtureBuilder,
} from './professionals.fixture.ts';

describe('Professionals RLS - SELECT', () => {
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

  it('should allow unauthenticated users to view all professionals', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('professionals')
      .select('*')
      .eq('user_id', professional.professionalId!);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].user_id, professional.professionalId);
  });

  it('should allow authenticated users to view all professionals', async () => {
    const professional1 = await fixtureBuilder.createOnboardedProfessional();
    const professional2 = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional1, professional2);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional1.token
    );
    const { data, error } = await authenticatedClient
      .from('professionals')
      .select('*')
      .eq('user_id', professional2.professionalId!);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].user_id, professional2.professionalId);
  });

  it('should allow admins to view all professionals', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(professional, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('professionals')
      .select('*')
      .eq('user_id', professional.professionalId!);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].user_id, professional.professionalId);
  });
});
