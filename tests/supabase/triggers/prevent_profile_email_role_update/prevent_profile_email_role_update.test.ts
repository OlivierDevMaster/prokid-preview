import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './prevent_profile_email_role_update.data.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './prevent_profile_email_role_update.fixture.ts';

describe('Trigger: prevent_profile_email_role_update_trigger', () => {
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

  it('should prevent direct email update on profile for professional', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser();
    fixtures.push(fixture);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      fixture.token
    );

    const newEmail = `updated-${Date.now()}@example.com`;

    const { error: updateError } = await authenticatedClient
      .from('profiles')
      .update({ email: newEmail })
      .eq('user_id', fixture.userId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Email cannot be updated directly'),
      true
    );
  });

  it('should prevent direct email update on profile for structure', async () => {
    const fixture = await fixtureBuilder.createStructureUser();
    fixtures.push(fixture);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      fixture.token
    );

    const newEmail = `updated-${Date.now()}@example.com`;

    const { error: updateError } = await authenticatedClient
      .from('profiles')
      .update({ email: newEmail })
      .eq('user_id', fixture.userId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Email cannot be updated directly'),
      true
    );
  });

  it('should prevent direct role update on profile for professional', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser();
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role: TriggerTestData.validRoles.structure })
      .eq('user_id', fixture.userId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Role cannot be updated directly'),
      true
    );
  });

  it('should prevent direct role update on profile for structure', async () => {
    const fixture = await fixtureBuilder.createStructureUser();
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role: TriggerTestData.validRoles.professional })
      .eq('user_id', fixture.userId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Role cannot be updated directly'),
      true
    );
  });

  it('should allow updating other profile fields', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser();
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ first_name: 'Updated Name' })
      .eq('user_id', fixture.userId);

    assertEquals(updateError, null);

    const { data: profileData } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertExists(profileData);
    assertEquals(profileData.first_name, 'Updated Name');
  });

  it('should allow email update through auth.users (system function)', async () => {
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
});
