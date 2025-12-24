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

describe('Structures RLS - UPDATE', () => {
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

  it('should prevent unauthenticated users from updating structures', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(structure);

    const { data: originalData } = await adminClient
      .from('structures')
      .select('name')
      .eq('user_id', structure.structureId!)
      .single();

    assertExists(originalData);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('structures')
      .update({ name: 'Updated Structure Name' })
      .eq('user_id', structure.structureId!)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);

    const { data: verifyData } = await adminClient
      .from('structures')
      .select('name')
      .eq('user_id', structure.structureId!)
      .single();

    assertEquals(verifyData?.name, originalData.name);
  });

  it('should prevent authenticated users (non-structures) from updating structures', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const user = await fixtureBuilder.createAuthenticatedUser();
    fixtures.push(structure, user);

    const { data: originalData } = await adminClient
      .from('structures')
      .select('name')
      .eq('user_id', structure.structureId!)
      .single();

    assertExists(originalData);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user.token
    );
    const { data, error } = await authenticatedClient
      .from('structures')
      .update({ name: 'Updated Structure Name' })
      .eq('user_id', structure.structureId!)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);

    const { data: verifyData } = await adminClient
      .from('structures')
      .select('name')
      .eq('user_id', structure.structureId!)
      .single();

    assertEquals(verifyData?.name, originalData.name);
  });

  it('should allow structures to update their own profile', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(structure);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure.token
    );
    const { data, error } = await structureClient
      .from('structures')
      .update({ name: 'Updated Structure Name' })
      .eq('user_id', structure.structureId!)
      .select('name')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.name, 'Updated Structure Name');
  });

  it("should prevent structures from updating other structures' profiles", async () => {
    const structure1 = await fixtureBuilder.createOnboardedStructure();
    const structure2 = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(structure1, structure2);

    const { data: originalData } = await adminClient
      .from('structures')
      .select('name')
      .eq('user_id', structure2.structureId!)
      .single();

    assertExists(originalData);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure1.token
    );
    const { data, error } = await structureClient
      .from('structures')
      .update({ name: 'Updated Structure Name' })
      .eq('user_id', structure2.structureId!)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);

    const { data: verifyData } = await adminClient
      .from('structures')
      .select('name')
      .eq('user_id', structure2.structureId!)
      .single();

    assertEquals(verifyData?.name, originalData.name);
  });

  it('should allow admins to update any structure profile', async () => {
    const structure = await fixtureBuilder.createOnboardedStructure();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(structure, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('structures')
      .update({ name: 'Admin Updated Structure Name' })
      .eq('user_id', structure.structureId!)
      .select('name')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.name, 'Admin Updated Structure Name');
  });
});
