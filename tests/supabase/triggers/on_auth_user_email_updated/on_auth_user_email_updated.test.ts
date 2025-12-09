import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './on_auth_user_email_updated.fixture.ts';

describe('Trigger: on_auth_user_email_updated', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: TriggerTestFixtureBuilder;
  let cleanupHelper: TriggerTestCleanupHelper;
  let fixtures: TriggerTestFixture[] = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new TriggerTestFixtureBuilder(adminClient, supabaseClient);
    cleanupHelper = new TriggerTestCleanupHelper(adminClient);
    fixtures = [];
  });

  afterEach(async () => {
    for (const fixture of fixtures) {
      await cleanupHelper.cleanupFixture(fixture);
    }
    fixtures = [];
  });

  it('should update profile email when auth.users email is updated for professional', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser();
    fixtures.push(fixture);

    const newEmail = `updated-${Date.now()}@example.com`;

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      fixture.userId,
      { email: newEmail }
    );

    assertEquals(updateError, null);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.email, newEmail);
  });

  it('should update profile email when auth.users email is updated for structure', async () => {
    const fixture = await fixtureBuilder.createStructureUser();
    fixtures.push(fixture);

    const newEmail = `updated-${Date.now()}@example.com`;

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      fixture.userId,
      { email: newEmail }
    );

    assertEquals(updateError, null);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.email, newEmail);
  });

  it('should NOT update profile email when auth.users email is unchanged', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser();
    fixtures.push(fixture);

    const { data: originalProfile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertExists(originalProfile);

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      fixture.userId,
      { user_metadata: { some_field: 'value' } }
    );

    assertEquals(updateError, null);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.email, originalProfile.email);
  });

  it('should handle multiple email updates correctly', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser();
    fixtures.push(fixture);

    const firstNewEmail = `first-updated-${Date.now()}@example.com`;
    const secondNewEmail = `second-updated-${Date.now()}@example.com`;

    const { error: firstUpdateError } =
      await adminClient.auth.admin.updateUserById(fixture.userId, {
        email: firstNewEmail,
      });

    assertEquals(firstUpdateError, null);
    await new Promise(resolve => setTimeout(resolve, 200));

    const { error: secondUpdateError } =
      await adminClient.auth.admin.updateUserById(fixture.userId, {
        email: secondNewEmail,
      });

    assertEquals(secondUpdateError, null);
    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.email, secondNewEmail);
  });
});
