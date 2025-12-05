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

describe('Availabilities RLS - DELETE', () => {
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
    const { data, error } = await unauthenticatedClient
      .from('availabilities')
      .delete()
      .eq('id', availability.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('availabilities')
      .select('id')
      .eq('id', availability.id)
      .single();

    assertExists(stillExists);
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
    const { data, error } = await authenticatedClient
      .from('availabilities')
      .delete()
      .eq('id', availability.id)
      .select();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.length, 1);

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
    const { data, error } = await authenticatedClient
      .from('availabilities')
      .delete()
      .eq('id', availability.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('availabilities')
      .select('id')
      .eq('id', availability.id)
      .single();

    assertExists(stillExists);
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
    const { data, error } = await adminAuthClient
      .from('availabilities')
      .delete()
      .eq('id', availability.id)
      .select();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.length, 1);

    const { data: deleted } = await adminClient
      .from('availabilities')
      .select('id')
      .eq('id', availability.id)
      .single();

    assertEquals(deleted, null);
  });

  it('should prevent structures from deleting availabilities', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

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

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure.token
    );
    const { data, error } = await structureClient
      .from('availabilities')
      .delete()
      .eq('id', availability.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('availabilities')
      .select('id')
      .eq('id', availability.id)
      .single();

    assertExists(stillExists);
  });
});
