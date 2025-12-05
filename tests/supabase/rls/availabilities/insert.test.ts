import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  AvailabilityRlsCleanupHelper,
  AvailabilityRlsFixture,
  AvailabilityRlsFixtureBuilder,
  StructureRlsFixture,
} from './availabilities.fixture.ts';

describe('Availabilities RLS - INSERT', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: AvailabilityRlsFixtureBuilder;
  let cleanupHelper: AvailabilityRlsCleanupHelper;
  let fixtures: Array<
    AdminRlsFixture | AvailabilityRlsFixture | StructureRlsFixture
  > = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new AvailabilityRlsFixtureBuilder(
      adminClient,
      supabaseClient
    );
    cleanupHelper = new AvailabilityRlsCleanupHelper(adminClient);
  });

  afterEach(async () => {
    for (const fixture of fixtures) {
      if ('professionalId' in fixture) {
        await cleanupHelper.cleanupAvailability(
          fixture as AvailabilityRlsFixture
        );
      } else if ('structureId' in fixture) {
        await cleanupHelper.cleanupStructure(fixture as StructureRlsFixture);
      } else {
        await cleanupHelper.cleanupAdmin(fixture as AdminRlsFixture);
      }
    }
    fixtures = [];
  });

  it('should prevent unauthenticated users from creating availabilities', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    const { data, error } = await unauthenticatedClient
      .from('availabilities')
      .insert({
        duration_mn: 180,
        rrule,
        user_id: professional.professionalId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow professionals to create their own availabilities', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    const { data, error } = await authenticatedClient
      .from('availabilities')
      .insert({
        duration_mn: 180,
        rrule,
        user_id: professional.professionalId!,
      })
      .select('id, user_id')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.user_id, professional.professionalId);
  });

  it('should prevent professionals from creating availabilities for other professionals', async () => {
    const professional1 = await fixtureBuilder.createOnboardedProfessional();
    const professional2 = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional1, professional2);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional1.token
    );
    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    const { data, error } = await authenticatedClient
      .from('availabilities')
      .insert({
        duration_mn: 180,
        rrule,
        user_id: professional2.professionalId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow admins to create availabilities for any professional', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(professional, admin);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    const { data, error } = await adminAuthClient
      .from('availabilities')
      .insert({
        duration_mn: 180,
        rrule,
        user_id: professional.professionalId!,
      })
      .select('id, user_id')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.user_id, professional.professionalId);
  });

  it('should prevent structures from creating availabilities', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure.token
    );
    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    const { data, error } = await structureClient
      .from('availabilities')
      .insert({
        duration_mn: 180,
        rrule,
        user_id: professional.professionalId!,
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });
});
