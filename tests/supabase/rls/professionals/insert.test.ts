import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  ProfessionalRlsCleanupHelper,
  ProfessionalRlsFixture,
  ProfessionalRlsFixtureBuilder,
} from './professionals.fixture.ts';

describe('Professionals RLS - INSERT', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: ProfessionalRlsFixtureBuilder;
  let cleanupHelper: ProfessionalRlsCleanupHelper;
  let fixtures: Array<AdminRlsFixture | ProfessionalRlsFixture> = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new ProfessionalRlsFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new ProfessionalRlsCleanupHelper(adminClient);
  });

  afterEach(async () => {
    for (const fixture of fixtures) {
      if ('professionalId' in fixture) {
        await cleanupHelper.cleanupProfessional(
          fixture as ProfessionalRlsFixture
        );
      } else {
        await cleanupHelper.cleanupAdmin(fixture as AdminRlsFixture);
      }
    }
    fixtures = [];
  });

  it('should prevent unauthenticated users from creating professional profiles', async () => {
    const professional = await fixtureBuilder.createProfessionalUser();
    fixtures.push(professional);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('professionals')
      .insert({
        city: 'Paris',
        description: 'Test professional',
        experience_years: 5,
        hourly_rate: 50.0,
        intervention_radius_km: 10,
        phone: '+33123456789',
        postal_code: '75001',
        skills: ['skill1', 'skill2'],
        user_id: professional.userId,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should prevent authenticated users (non-professionals) from creating professional profiles', async () => {
    const user = await fixtureBuilder.createAuthenticatedUser();
    fixtures.push(user);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      user.token
    );
    const { data, error } = await authenticatedClient
      .from('professionals')
      .insert({
        city: 'Paris',
        description: 'Test professional',
        experience_years: 5,
        hourly_rate: 50.0,
        intervention_radius_km: 10,
        phone: '+33123456789',
        postal_code: '75001',
        skills: ['skill1', 'skill2'],
        user_id: user.userId,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow users to create their own professional profile', async () => {
    const professional = await fixtureBuilder.createProfessionalUser();
    fixtures.push(professional);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { data, error } = await authenticatedClient
      .from('professionals')
      .insert({
        city: 'Paris',
        description: 'Test professional',
        experience_years: 5,
        hourly_rate: 50.0,
        intervention_radius_km: 10,
        phone: '+33123456789',
        postal_code: '75001',
        skills: ['skill1', 'skill2'],
        user_id: professional.userId,
      })
      .select('user_id')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.user_id, professional.userId);
  });

  it('should prevent users from creating professional profiles for other users', async () => {
    const professional1 = await fixtureBuilder.createProfessionalUser();
    const professional2 = await fixtureBuilder.createProfessionalUser();
    fixtures.push(professional1, professional2);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional1.token
    );
    const { data, error } = await authenticatedClient
      .from('professionals')
      .insert({
        city: 'Paris',
        description: 'Test professional',
        experience_years: 5,
        hourly_rate: 50.0,
        intervention_radius_km: 10,
        phone: '+33123456789',
        postal_code: '75001',
        skills: ['skill1', 'skill2'],
        user_id: professional2.userId,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow admins to create professional profiles for any user', async () => {
    const professional = await fixtureBuilder.createProfessionalUser();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(professional, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('professionals')
      .insert({
        city: 'Paris',
        description: 'Test professional',
        experience_years: 5,
        hourly_rate: 50.0,
        intervention_radius_km: 10,
        phone: '+33123456789',
        postal_code: '75001',
        skills: ['skill1', 'skill2'],
        user_id: professional.userId,
      })
      .select('user_id')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.user_id, professional.userId);
  });
});
