import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './log_membership_left.data.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './log_membership_left.fixture.ts';

describe('Trigger: trigger_log_membership_left', () => {
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

  it('should log membership left event when deleted_at is set via admin', async () => {
    const fixture = await fixtureBuilder.createMembership();
    fixtures.push(fixture);

    const deletedAt = new Date().toISOString();

    const { error: updateError } = await adminClient
      .from('structure_members')
      .update({ deleted_at: deletedAt })
      .eq('id', fixture.membershipId);

    assertEquals(updateError, null);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: historyData, error: historyError } = await adminClient
      .from('structure_membership_history')
      .select('*')
      .eq('membership_id', fixture.membershipId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    assertEquals(historyError, null);
    assertExists(historyData);
    assertEquals(historyData.action, TriggerTestData.membershipActions.left);
    assertEquals(historyData.membership_id, fixture.membershipId);
    assertEquals(historyData.structure_id, fixture.structureId);
    assertEquals(historyData.professional_id, fixture.professionalId);
    assertExists(historyData.initiated_by);
    assertExists(historyData.initiated_by_role);
    assertExists(historyData.created_at);
  });

  it('should NOT log when deleted_at is already set and remains the same', async () => {
    const fixture = await fixtureBuilder.createMembership();
    fixtures.push(fixture);

    const deletedAt = new Date().toISOString();

    await adminClient
      .from('structure_members')
      .update({ deleted_at: deletedAt })
      .eq('id', fixture.membershipId);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: firstHistory } = await adminClient
      .from('structure_membership_history')
      .select('id')
      .eq('membership_id', fixture.membershipId);

    assertExists(firstHistory);
    const firstCount = firstHistory.length;

    await adminClient
      .from('structure_members')
      .update({ deleted_at: deletedAt })
      .eq('id', fixture.membershipId);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: secondHistory } = await adminClient
      .from('structure_membership_history')
      .select('id')
      .eq('membership_id', fixture.membershipId);

    assertExists(secondHistory);
    assertEquals(secondHistory.length, firstCount);
  });

  it('should NOT log when deleted_at is set to NULL', async () => {
    const fixture = await fixtureBuilder.createMembership();
    fixtures.push(fixture);

    const deletedAt = new Date().toISOString();

    await adminClient
      .from('structure_members')
      .update({ deleted_at: deletedAt })
      .eq('id', fixture.membershipId);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: firstHistory } = await adminClient
      .from('structure_membership_history')
      .select('id')
      .eq('membership_id', fixture.membershipId);

    assertExists(firstHistory);
    const firstCount = firstHistory.length;

    await adminClient
      .from('structure_members')
      .update({ deleted_at: null })
      .eq('id', fixture.membershipId);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: secondHistory } = await adminClient
      .from('structure_membership_history')
      .select('id')
      .eq('membership_id', fixture.membershipId);

    assertExists(secondHistory);
    assertEquals(secondHistory.length, firstCount);
  });

  it('should log with correct structure_id and professional_id', async () => {
    const fixture = await fixtureBuilder.createMembership();
    fixtures.push(fixture);

    const deletedAt = new Date().toISOString();

    await adminClient
      .from('structure_members')
      .update({ deleted_at: deletedAt })
      .eq('id', fixture.membershipId);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: historyData, error: historyError } = await adminClient
      .from('structure_membership_history')
      .select('structure_id, professional_id, membership_id')
      .eq('membership_id', fixture.membershipId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    assertEquals(historyError, null);
    assertExists(historyData);
    assertEquals(historyData.structure_id, fixture.structureId);
    assertEquals(historyData.professional_id, fixture.professionalId);
    assertEquals(historyData.membership_id, fixture.membershipId);
  });

  it('should log action as left when professional initiates the deletion', async () => {
    const fixture = await fixtureBuilder.createMembership();
    fixtures.push(fixture);

    if (!fixture.professionalToken) {
      throw new Error('Professional token not available');
    }

    const professionalClient = supabaseClient.createAuthenticatedClient(
      fixture.professionalToken
    );

    const deletedAt = new Date().toISOString();

    const { error: updateError } = await professionalClient
      .from('structure_members')
      .update({ deleted_at: deletedAt })
      .eq('id', fixture.membershipId)
      .eq('professional_id', fixture.professionalId);

    assertEquals(updateError, null);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: historyData, error: historyError } = await adminClient
      .from('structure_membership_history')
      .select('action, initiated_by, initiated_by_role')
      .eq('membership_id', fixture.membershipId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    assertEquals(historyError, null);
    assertExists(historyData);
    assertEquals(historyData.action, TriggerTestData.membershipActions.left);
    assertEquals(historyData.initiated_by, fixture.professionalId);
    assertEquals(historyData.initiated_by_role, 'professional');
  });

  it('should log action as removed_by_structure when structure initiates the deletion', async () => {
    const fixture = await fixtureBuilder.createMembership();
    fixtures.push(fixture);

    if (!fixture.structureToken) {
      throw new Error('Structure token not available');
    }

    const structureClient = supabaseClient.createAuthenticatedClient(
      fixture.structureToken
    );

    const deletedAt = new Date().toISOString();

    const { error: updateError } = await structureClient
      .from('structure_members')
      .update({ deleted_at: deletedAt })
      .eq('id', fixture.membershipId)
      .eq('structure_id', fixture.structureId);

    assertEquals(updateError, null);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: historyData, error: historyError } = await adminClient
      .from('structure_membership_history')
      .select('action, initiated_by, initiated_by_role')
      .eq('membership_id', fixture.membershipId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    assertEquals(historyError, null);
    assertExists(historyData);
    assertEquals(
      historyData.action,
      TriggerTestData.membershipActions.removedByStructure
    );
    assertEquals(historyData.initiated_by, fixture.structureId);
    assertEquals(historyData.initiated_by_role, 'structure');
  });
});
