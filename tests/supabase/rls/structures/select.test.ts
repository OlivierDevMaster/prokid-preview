import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  ProfessionalRlsFixture,
  StructureRlsCleanupHelper,
  StructureRlsFixture,
  StructureRlsFixtureBuilder,
} from './structures.fixture.ts';

describe('Structures RLS - SELECT', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: StructureRlsFixtureBuilder;
  let cleanupHelper: StructureRlsCleanupHelper;
  let fixtures: Array<
    AdminRlsFixture | ProfessionalRlsFixture | StructureRlsFixture
  > = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new StructureRlsFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new StructureRlsCleanupHelper(adminClient);
  });

  afterEach(async () => {
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

  it('should allow unauthenticated users to view all structures', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(structure);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('structures')
      .select('*')
      .eq('user_id', structure.structureId!);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].user_id, structure.structureId);
  });

  it('should allow authenticated users (non-structures) to view all structures', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const user = await fixtureBuilder.createAuthenticatedUser();
    fixtures.push(structure, user);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user.token
    );
    const { data, error } = await authenticatedClient
      .from('structures')
      .select('*')
      .eq('user_id', structure.structureId!);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].user_id, structure.structureId);
  });

  it('should allow structures to view all structures', async () => {
    const structure1 = await fixtureBuilder.createOnboardedStructure();
    const structure2 = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(structure1, structure2);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure1.token
    );
    const { data, error } = await structureClient
      .from('structures')
      .select('*')
      .eq('user_id', structure2.structureId!);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].user_id, structure2.structureId);
  });

  it('should allow admins to view all structures', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(structure, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('structures')
      .select('*')
      .eq('user_id', structure.structureId!);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].user_id, structure.structureId);
  });
});
