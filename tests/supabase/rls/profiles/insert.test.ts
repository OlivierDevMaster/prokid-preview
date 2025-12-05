import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  ProfileRlsCleanupHelper,
  ProfileRlsFixture,
  ProfileRlsFixtureBuilder,
} from './profiles.fixture.ts';

describe('Profiles RLS - INSERT', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: ProfileRlsFixtureBuilder;
  let cleanupHelper: ProfileRlsCleanupHelper;
  let fixtures: Array<AdminRlsFixture | ProfileRlsFixture> = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new ProfileRlsFixtureBuilder(adminClient, supabaseClient);
    cleanupHelper = new ProfileRlsCleanupHelper(adminClient);
  });

  afterEach(async () => {
    for (const fixture of fixtures) {
      if ('role' in fixture) {
        await cleanupHelper.cleanupProfile(fixture as ProfileRlsFixture);
      } else {
        await cleanupHelper.cleanupAdmin(fixture as AdminRlsFixture);
      }
    }
    fixtures = [];
  });

  it('should prevent unauthenticated users from inserting profiles', async () => {
    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('profiles')
      .insert({
        email: `test-${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'User',
        role: 'professional',
        user_id: '00000000-0000-0000-0000-000000000000',
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should prevent authenticated users from inserting profiles', async () => {
    const user = await fixtureBuilder.createProfileUser();
    fixtures.push(user);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user.token
    );
    const { data, error } = await authenticatedClient
      .from('profiles')
      .insert({
        email: `test-${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'User',
        role: 'professional',
        user_id: '00000000-0000-0000-0000-000000000000',
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should prevent admins from inserting profiles', async () => {
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('profiles')
      .insert({
        email: `test-${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'User',
        role: 'professional',
        user_id: '00000000-0000-0000-0000-000000000000',
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });
});
