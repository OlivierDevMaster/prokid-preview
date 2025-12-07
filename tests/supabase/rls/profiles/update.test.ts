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

describe('Profiles RLS - UPDATE', () => {
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

  it('should prevent unauthenticated users from updating profiles', async () => {
    const user = await fixtureBuilder.createProfileUser();
    fixtures.push(user);

    const { data: originalData } = await adminClient
      .from('profiles')
      .select('first_name')
      .eq('user_id', user.userId)
      .single();

    assertExists(originalData);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('profiles')
      .update({ first_name: 'Updated Name' })
      .eq('user_id', user.userId)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);

    const { data: verifyData } = await adminClient
      .from('profiles')
      .select('first_name')
      .eq('user_id', user.userId)
      .single();

    assertEquals(verifyData?.first_name, originalData.first_name);
  });

  it('should prevent authenticated users from updating other profiles', async () => {
    const user1 = await fixtureBuilder.createProfileUser();
    const user2 = await fixtureBuilder.createProfileUser();
    fixtures.push(user1, user2);

    const { data: originalData } = await adminClient
      .from('profiles')
      .select('first_name')
      .eq('user_id', user2.userId)
      .single();

    assertExists(originalData);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user1.token
    );
    const { data, error } = await authenticatedClient
      .from('profiles')
      .update({ first_name: 'Updated Name' })
      .eq('user_id', user2.userId)
      .select();

    assertEquals(data, []);
    assertEquals(error, null);

    const { data: verifyData } = await adminClient
      .from('profiles')
      .select('first_name')
      .eq('user_id', user2.userId)
      .single();

    assertEquals(verifyData?.first_name, originalData.first_name);
  });

  it('should allow users to update their own profile', async () => {
    const user = await fixtureBuilder.createProfileUser();
    fixtures.push(user);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user.token
    );
    const { data, error } = await authenticatedClient
      .from('profiles')
      .update({ first_name: 'Updated Name' })
      .eq('user_id', user.userId)
      .select('first_name')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.first_name, 'Updated Name');
  });

  it('should prevent users from updating their own email', async () => {
    const user = await fixtureBuilder.createProfileUser();
    fixtures.push(user);

    const { data: originalData } = await adminClient
      .from('profiles')
      .select('email')
      .eq('user_id', user.userId)
      .single();

    assertExists(originalData);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user.token
    );
    const { data, error } = await authenticatedClient
      .from('profiles')
      .update({ email: 'newemail@example.com' })
      .eq('user_id', user.userId)
      .select();

    if (error) {
      assertExists(error);
    } else {
      assertEquals(data, []);
    }

    const { data: verifyData } = await adminClient
      .from('profiles')
      .select('email')
      .eq('user_id', user.userId)
      .single();

    assertEquals(verifyData?.email, originalData.email);
  });

  it('should prevent users from updating their own role', async () => {
    const user = await fixtureBuilder.createProfileUser('professional');
    fixtures.push(user);

    const { data: originalData } = await adminClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.userId)
      .single();

    assertExists(originalData);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user.token
    );
    const { data, error } = await authenticatedClient
      .from('profiles')
      .update({ role: 'structure' })
      .eq('user_id', user.userId)
      .select();

    if (error) {
      assertExists(error);
    } else {
      assertEquals(data, []);
    }

    const { data: verifyData } = await adminClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.userId)
      .single();

    assertEquals(verifyData?.role, originalData.role);
  });

  it('should allow admins to update any profile', async () => {
    const user = await fixtureBuilder.createProfileUser();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(user, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('profiles')
      .update({ first_name: 'Admin Updated Name' })
      .eq('user_id', user.userId)
      .select('first_name')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.first_name, 'Admin Updated Name');
  });

  it('should prevent admins from updating email', async () => {
    const user = await fixtureBuilder.createProfileUser();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(user, admin);

    const { data: originalData } = await adminClient
      .from('profiles')
      .select('email')
      .eq('user_id', user.userId)
      .single();

    assertExists(originalData);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('profiles')
      .update({ email: 'adminupdated@example.com' })
      .eq('user_id', user.userId)
      .select();

    if (error) {
      assertExists(error);
    } else {
      assertEquals(data, []);
    }

    const { data: verifyData } = await adminClient
      .from('profiles')
      .select('email')
      .eq('user_id', user.userId)
      .single();

    assertEquals(verifyData?.email, originalData.email);
  });

  it('should prevent admins from updating role', async () => {
    const user = await fixtureBuilder.createProfileUser('professional');
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(user, admin);

    const { data: originalData } = await adminClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.userId)
      .single();

    assertExists(originalData);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('profiles')
      .update({ role: 'structure' })
      .eq('user_id', user.userId)
      .select();

    if (error) {
      assertExists(error);
    } else {
      assertEquals(data, []);
    }

    const { data: verifyData } = await adminClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.userId)
      .single();

    assertEquals(verifyData?.role, originalData.role);
  });
});
