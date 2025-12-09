import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './handle_invitation_accepted.data.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './handle_invitation_accepted.fixture.ts';

describe('Trigger: trigger_handle_invitation_accepted', () => {
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

  it('should create membership when invitation status changes to accepted', async () => {
    const fixture = await fixtureBuilder.createPendingInvitation();
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.accepted })
      .eq('id', fixture.invitationId);

    assertEquals(updateError, null);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: membershipData, error: membershipError } = await adminClient
      .from('structure_members')
      .select('*')
      .eq('structure_id', fixture.structureId)
      .eq('professional_id', fixture.professionalId)
      .is('deleted_at', null)
      .single();

    assertEquals(membershipError, null);
    assertExists(membershipData);
    assertEquals(membershipData.structure_id, fixture.structureId);
    assertEquals(membershipData.professional_id, fixture.professionalId);
    assertEquals(membershipData.deleted_at, null);
  });

  it('should NOT create membership when invitation status changes to declined', async () => {
    const fixture = await fixtureBuilder.createPendingInvitation();
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.declined })
      .eq('id', fixture.invitationId);

    assertEquals(updateError, null);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: membershipData, error: membershipError } = await adminClient
      .from('structure_members')
      .select('*')
      .eq('structure_id', fixture.structureId)
      .eq('professional_id', fixture.professionalId)
      .is('deleted_at', null)
      .single();

    assertExists(membershipError);
    assertEquals(membershipData, null);
  });

  it('should NOT create duplicate membership if active membership already exists', async () => {
    const fixture =
      await fixtureBuilder.createInvitationWithExistingMembership();
    fixtures.push(fixture);

    const { data: existingMemberships } = await adminClient
      .from('structure_members')
      .select('id')
      .eq('structure_id', fixture.structureId)
      .eq('professional_id', fixture.professionalId)
      .is('deleted_at', null);

    assertExists(existingMemberships);
    const initialCount = existingMemberships.length;

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.accepted })
      .eq('id', fixture.invitationId);

    assertEquals(updateError, null);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: membershipsAfter } = await adminClient
      .from('structure_members')
      .select('id')
      .eq('structure_id', fixture.structureId)
      .eq('professional_id', fixture.professionalId)
      .is('deleted_at', null);

    assertExists(membershipsAfter);
    assertEquals(membershipsAfter.length, initialCount);
  });

  it('should create new membership even if soft-deleted membership exists', async () => {
    const fixture = await fixtureBuilder.createPendingInvitation();
    fixtures.push(fixture);

    const { data: oldMembership } = await adminClient
      .from('structure_members')
      .insert({
        professional_id: fixture.professionalId,
        structure_id: fixture.structureId,
      })
      .select('id')
      .single();

    assertExists(oldMembership);

    await adminClient
      .from('structure_members')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', oldMembership.id);

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.accepted })
      .eq('id', fixture.invitationId);

    assertEquals(updateError, null);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: newMembershipData, error: newMembershipError } =
      await adminClient
        .from('structure_members')
        .select('*')
        .eq('structure_id', fixture.structureId)
        .eq('professional_id', fixture.professionalId)
        .is('deleted_at', null)
        .single();

    assertEquals(newMembershipError, null);
    assertExists(newMembershipData);
    assertEquals(newMembershipData.id !== oldMembership.id, true);
  });

  it('should NOT trigger when status changes from accepted to accepted', async () => {
    const fixture = await fixtureBuilder.createPendingInvitation();
    fixtures.push(fixture);

    await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.accepted })
      .eq('id', fixture.invitationId);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: firstMemberships } = await adminClient
      .from('structure_members')
      .select('id')
      .eq('structure_id', fixture.structureId)
      .eq('professional_id', fixture.professionalId)
      .is('deleted_at', null);

    assertExists(firstMemberships);
    const firstCount = firstMemberships.length;

    await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.accepted })
      .eq('id', fixture.invitationId);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: secondMemberships } = await adminClient
      .from('structure_members')
      .select('id')
      .eq('structure_id', fixture.structureId)
      .eq('professional_id', fixture.professionalId)
      .is('deleted_at', null);

    assertExists(secondMemberships);
    assertEquals(secondMemberships.length, firstCount);
  });
});
