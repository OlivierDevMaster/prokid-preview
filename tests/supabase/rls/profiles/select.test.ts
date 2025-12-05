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

describe('Profiles RLS - SELECT', () => {
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

  it('should allow unauthenticated users to view all profiles', async () => {
    const user = await fixtureBuilder.createProfileUser();
    fixtures.push(user);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.userId)
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.user_id, user.userId);
  });

  it('should allow authenticated users to view all profiles', async () => {
    const user1 = await fixtureBuilder.createProfileUser();
    const user2 = await fixtureBuilder.createProfileUser();
    fixtures.push(user1, user2);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user1.token
    );
    const { data, error } = await authenticatedClient
      .from('profiles')
      .select('*')
      .eq('user_id', user2.userId)
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.user_id, user2.userId);
  });

  it('should allow admins to view all profiles', async () => {
    const user = await fixtureBuilder.createProfileUser();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(user, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.userId)
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.user_id, user.userId);
  });
});
