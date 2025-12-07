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

describe('Profiles RLS - DELETE', () => {
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

  it('should prevent unauthenticated users from deleting profiles', async () => {
    const user = await fixtureBuilder.createProfileUser();
    fixtures.push(user);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('profiles')
      .delete()
      .eq('user_id', user.userId)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.userId)
      .single();

    assertExists(stillExists);
  });

  it('should prevent authenticated users from deleting other profiles', async () => {
    const user1 = await fixtureBuilder.createProfileUser();
    const user2 = await fixtureBuilder.createProfileUser();
    fixtures.push(user1, user2);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user1.token
    );
    const { data, error } = await authenticatedClient
      .from('profiles')
      .delete()
      .eq('user_id', user2.userId)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('profiles')
      .select('user_id')
      .eq('user_id', user2.userId)
      .single();

    assertExists(stillExists);
  });

  it('should allow users to delete their own profile', async () => {
    const user = await fixtureBuilder.createProfileUser();
    fixtures.push(user);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user.token
    );
    const { data, error } = await authenticatedClient
      .from('profiles')
      .delete()
      .eq('user_id', user.userId)
      .select();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.length, 1);

    const { data: deleted } = await adminClient
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.userId)
      .single();

    assertEquals(deleted, null);
  });

  it('should allow admins to delete any profile', async () => {
    const user = await fixtureBuilder.createProfileUser();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(user, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('profiles')
      .delete()
      .eq('user_id', user.userId)
      .select();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.length, 1);

    const { data: deleted } = await adminClient
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.userId)
      .single();

    assertEquals(deleted, null);
  });
});
