import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  AvailabilityRlsCleanupHelper,
  AvailabilityRlsFixture,
  AvailabilityRlsFixtureBuilder,
} from './availabilities.fixture.ts';

describe('Availabilities RLS - DELETE', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: AvailabilityRlsFixtureBuilder;
  let cleanupHelper: AvailabilityRlsCleanupHelper;
  let fixtures: Array<AdminRlsFixture | AvailabilityRlsFixture> = [];

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
      } else {
        await cleanupHelper.cleanupAdmin(fixture as AdminRlsFixture);
      }
    }
    fixtures = [];
  });

  it('should prevent unauthenticated users from deleting availabilities', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional);

    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    const { data: availability } = await adminClient
      .from('availabilities')
      .insert({
        duration_mn: 180,
        rrule,
        user_id: professional.professionalId!,
      })
      .select('id')
      .single();

    assertExists(availability);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { error } = await unauthenticatedClient
      .from('availabilities')
      .delete()
      .eq('id', availability.id);

    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow professionals to delete their own availabilities', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional);

    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    const { data: availability } = await adminClient
      .from('availabilities')
      .insert({
        duration_mn: 180,
        rrule,
        user_id: professional.professionalId!,
      })
      .select('id')
      .single();

    assertExists(availability);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { error } = await authenticatedClient
      .from('availabilities')
      .delete()
      .eq('id', availability.id);

    assertEquals(error, null);

    const { data: deleted } = await adminClient
      .from('availabilities')
      .select('id')
      .eq('id', availability.id)
      .single();

    assertEquals(deleted, null);
  });

  it("should prevent professionals from deleting other professionals' availabilities", async () => {
    const professional1 = await fixtureBuilder.createOnboardedProfessional();
    const professional2 = await fixtureBuilder.createOnboardedProfessional();
    fixtures.push(professional1, professional2);

    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    const { data: availability } = await adminClient
      .from('availabilities')
      .insert({
        duration_mn: 180,
        rrule,
        user_id: professional2.professionalId!,
      })
      .select('id')
      .single();

    assertExists(availability);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional1.token
    );
    const { error } = await authenticatedClient
      .from('availabilities')
      .delete()
      .eq('id', availability.id);

    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow admins to delete any availability', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(professional, admin);

    const rrule = `DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO`;
    const { data: availability } = await adminClient
      .from('availabilities')
      .insert({
        duration_mn: 180,
        rrule,
        user_id: professional.professionalId!,
      })
      .select('id')
      .single();

    assertExists(availability);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { error } = await adminAuthClient
      .from('availabilities')
      .delete()
      .eq('id', availability.id);

    assertEquals(error, null);

    const { data: deleted } = await adminClient
      .from('availabilities')
      .select('id')
      .eq('id', availability.id)
      .single();

    assertEquals(deleted, null);
  });
});
