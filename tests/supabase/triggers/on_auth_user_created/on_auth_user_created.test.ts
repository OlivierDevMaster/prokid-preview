import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './on_auth_user_created.data.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './on_auth_user_created.fixture.ts';

describe('Trigger: on_auth_user_created', () => {
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

  it('should create a profile when a user with role "professional" is created', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser();
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.user_id, fixture.userId);
    assertEquals(profileData.role, TriggerTestData.validRoles.professional);
    assertEquals(profileData.email, fixture.email);
    assertEquals(profileData.first_name, null);
    assertEquals(profileData.last_name, null);
    assertEquals(profileData.avatar_url, null);
    assertEquals(profileData.preferred_language, 'fr');
    assertEquals(profileData.is_onboarded, false);
    assertExists(profileData.created_at);
  });

  it('should create a profile when a user with role "structure" is created', async () => {
    const fixture = await fixtureBuilder.createStructureUser();
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.user_id, fixture.userId);
    assertEquals(profileData.role, TriggerTestData.validRoles.structure);
    assertEquals(profileData.email, fixture.email);
    assertEquals(profileData.first_name, null);
    assertEquals(profileData.last_name, null);
    assertEquals(profileData.avatar_url, null);
    assertEquals(profileData.preferred_language, 'fr');
    assertEquals(profileData.is_onboarded, false);
    assertExists(profileData.created_at);
  });

  it('should NOT create a profile when a user with role "admin" is created', async () => {
    const fixture = await fixtureBuilder.createAdminUser();
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileData, null);
    assertExists(profileError);
  });

  it('should NOT create a profile when a user without role is created', async () => {
    const fixture = await fixtureBuilder.createUserWithoutRole();
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileData, null);
    assertExists(profileError);
  });

  it('should NOT create a profile when a user with invalid role is created', async () => {
    const fixture = await fixtureBuilder.createUserWithInvalidRole();
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileData, null);
    assertExists(profileError);
  });

  it('should create a profile with optional fields when provided', async () => {
    const metadata = TriggerTestData.metadata.withAllFields;
    const fixture = await fixtureBuilder.createProfessionalUser(metadata);
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.user_id, fixture.userId);
    assertEquals(profileData.role, TriggerTestData.validRoles.professional);
    assertEquals(profileData.email, fixture.email);
    assertEquals(profileData.first_name, metadata.first_name);
    assertEquals(profileData.last_name, metadata.last_name);
    assertEquals(profileData.avatar_url, metadata.avatar_url);
    assertEquals(profileData.preferred_language, metadata.preferred_language);
  });

  it('should set optional fields to NULL when empty strings are provided', async () => {
    const metadata = TriggerTestData.metadata.withEmptyStrings;
    const fixture = await fixtureBuilder.createProfessionalUser(metadata);
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.user_id, fixture.userId);
    assertEquals(profileData.role, TriggerTestData.validRoles.professional);
    assertEquals(profileData.email, fixture.email);
    assertEquals(profileData.first_name, null);
    assertEquals(profileData.last_name, null);
    assertEquals(profileData.avatar_url, null);
    assertEquals(profileData.preferred_language, 'fr');
  });

  it('should set optional fields to NULL when whitespace-only strings are provided', async () => {
    const metadata = TriggerTestData.metadata.withWhitespace;
    const fixture = await fixtureBuilder.createProfessionalUser(metadata);
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.user_id, fixture.userId);
    assertEquals(profileData.role, TriggerTestData.validRoles.professional);
    assertEquals(profileData.email, fixture.email);
    assertEquals(profileData.first_name, null);
    assertEquals(profileData.last_name, null);
    assertEquals(profileData.avatar_url, null);
    assertEquals(profileData.preferred_language, 'fr');
  });

  it('should set optional fields to NULL when they are not provided', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser();
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.user_id, fixture.userId);
    assertEquals(profileData.role, TriggerTestData.validRoles.professional);
    assertEquals(profileData.email, fixture.email);
    assertEquals(profileData.first_name, null);
    assertEquals(profileData.last_name, null);
    assertEquals(profileData.avatar_url, null);
    assertEquals(profileData.preferred_language, 'fr');
  });

  it('should correctly extract and trim optional fields', async () => {
    const metadata = TriggerTestData.metadata.withTrimmedFields;
    const fixture = await fixtureBuilder.createProfessionalUser(metadata);
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.user_id, fixture.userId);
    assertEquals(profileData.role, TriggerTestData.validRoles.professional);
    assertEquals(profileData.email, fixture.email);
    assertEquals(profileData.first_name, 'Jane');
    assertEquals(profileData.last_name, 'Smith');
    assertEquals(profileData.avatar_url, 'https://example.com/avatar.jpg');
    assertEquals(profileData.preferred_language, 'fr');
  });

  it('should use email from auth.users table', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser();
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('email')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.email, fixture.email);
  });

  it('should create profile for structure role with all fields', async () => {
    const metadata = TriggerTestData.metadata.structureFull;
    const fixture = await fixtureBuilder.createStructureUser(metadata);
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.user_id, fixture.userId);
    assertEquals(profileData.role, TriggerTestData.validRoles.structure);
    assertEquals(profileData.email, fixture.email);
    assertEquals(profileData.first_name, metadata.first_name);
    assertEquals(profileData.last_name, metadata.last_name);
    assertEquals(profileData.avatar_url, metadata.avatar_url);
    assertEquals(profileData.preferred_language, metadata.preferred_language);
    assertEquals(profileData.is_onboarded, false);
  });

  it('should default preferred_language to "fr" when not provided', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser();
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.preferred_language, 'fr');
  });

  it('should default preferred_language to "fr" when invalid value is provided', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser({
      preferred_language: 'invalid',
    });
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.preferred_language, 'fr');
  });

  it('should set preferred_language to "fr" when provided', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser({
      preferred_language: 'fr',
    });
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.preferred_language, 'fr');
  });

  it('should trim whitespace from preferred_language and validate', async () => {
    const fixture = await fixtureBuilder.createProfessionalUser({
      preferred_language: '  fr  ',
    });
    fixtures.push(fixture);

    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', fixture.userId)
      .single();

    assertEquals(profileError, null);
    assertExists(profileData);
    assertEquals(profileData.preferred_language, 'fr');
  });
});
