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

describe('Structures RLS - INSERT', () => {
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

  it('should prevent unauthenticated users from creating structures', async () => {
    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('structures')
      .insert({
        name: 'Test Structure',
        user_id: crypto.randomUUID(),
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should prevent authenticated users (non-structures) from creating structures', async () => {
    const user = await fixtureBuilder.createAuthenticatedUser();
    fixtures.push(user);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user.token
    );
    const { data, error } = await authenticatedClient
      .from('structures')
      .insert({
        name: 'Test Structure',
        user_id: user.userId,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow structures to create their own structure profile', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(structure);

    // First, delete the structure that was created during onboarding
    await adminClient
      .from('structures')
      .delete()
      .eq('user_id', structure.structureId!);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure.token
    );
    const { data, error } = await structureClient
      .from('structures')
      .insert({
        name: 'My Structure',
        user_id: structure.structureId!,
      })
      .select('user_id, name')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.user_id, structure.structureId);
    assertEquals(data.name, 'My Structure');
  });

  it('should prevent structures from creating structure profiles for other users', async () => {
    const structure1 = await fixtureBuilder.createOnboardedStructure();
    const structure2 = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(structure1, structure2);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure1.token
    );
    const { data, error } = await structureClient
      .from('structures')
      .insert({
        name: 'Other Structure',
        user_id: structure2.structureId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow admins to create structure profiles for any user', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(structure, admin);

    // First, delete the structure that was created during onboarding
    await adminClient
      .from('structures')
      .delete()
      .eq('user_id', structure.structureId!);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('structures')
      .insert({
        name: 'Admin Created Structure',
        user_id: structure.structureId!,
      })
      .select('user_id, name')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.user_id, structure.structureId);
    assertEquals(data.name, 'Admin Created Structure');
  });
});
