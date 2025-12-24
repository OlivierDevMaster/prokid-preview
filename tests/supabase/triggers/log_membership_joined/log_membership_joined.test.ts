import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './log_membership_joined.data.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './log_membership_joined.fixture.ts';

describe('Trigger: trigger_log_membership_joined', () => {
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

  it('should log membership joined event when membership is created', async () => {
    const { professionalId, structureId } =
      await fixtureBuilder.createStructureAndProfessional();

    const { data: membershipData, error: membershipError } = await adminClient
      .from('structure_members')
      .insert({
        professional_id: professionalId,
        structure_id: structureId,
      })
      .select('id')
      .single();

    assertEquals(membershipError, null);
    assertExists(membershipData);

    const fixture: TriggerTestFixture = {
      adminClient,
      membershipId: membershipData.id,
      professionalId,
      structureId,
      supabaseClient,
    };
    fixtures.push(fixture);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: historyData, error: historyError } = await adminClient
      .from('structure_membership_history')
      .select('*')
      .eq('membership_id', membershipData.id)
      .single();

    assertEquals(historyError, null);
    assertExists(historyData);
    assertEquals(historyData.action, TriggerTestData.membershipActions.joined);
    assertEquals(historyData.membership_id, membershipData.id);
    assertEquals(historyData.structure_id, structureId);
    assertEquals(historyData.professional_id, professionalId);
    assertEquals(historyData.initiated_by, professionalId);
    assertEquals(historyData.initiated_by_role, 'professional');
    assertExists(historyData.created_at);
  });

  it('should set initiated_by to professional_id when membership is created', async () => {
    const { professionalId, structureId } =
      await fixtureBuilder.createStructureAndProfessional();

    const { data: membershipData, error: membershipError } = await adminClient
      .from('structure_members')
      .insert({
        professional_id: professionalId,
        structure_id: structureId,
      })
      .select('id')
      .single();

    assertEquals(membershipError, null);
    assertExists(membershipData);

    const fixture: TriggerTestFixture = {
      adminClient,
      membershipId: membershipData.id,
      professionalId,
      structureId,
      supabaseClient,
    };
    fixtures.push(fixture);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: historyData, error: historyError } = await adminClient
      .from('structure_membership_history')
      .select('initiated_by, initiated_by_role')
      .eq('membership_id', membershipData.id)
      .single();

    assertEquals(historyError, null);
    assertExists(historyData);
    assertEquals(historyData.initiated_by, professionalId);
    assertEquals(historyData.initiated_by_role, 'professional');
  });

  it('should create history entry with correct structure and professional references', async () => {
    const { professionalId, structureId } =
      await fixtureBuilder.createStructureAndProfessional();

    const { data: membershipData, error: membershipError } = await adminClient
      .from('structure_members')
      .insert({
        professional_id: professionalId,
        structure_id: structureId,
      })
      .select('id')
      .single();

    assertEquals(membershipError, null);
    assertExists(membershipData);

    const fixture: TriggerTestFixture = {
      adminClient,
      membershipId: membershipData.id,
      professionalId,
      structureId,
      supabaseClient,
    };
    fixtures.push(fixture);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: historyData, error: historyError } = await adminClient
      .from('structure_membership_history')
      .select('structure_id, professional_id, membership_id')
      .eq('membership_id', membershipData.id)
      .single();

    assertEquals(historyError, null);
    assertExists(historyData);
    assertEquals(historyData.structure_id, structureId);
    assertEquals(historyData.professional_id, professionalId);
    assertEquals(historyData.membership_id, membershipData.id);
  });
});
