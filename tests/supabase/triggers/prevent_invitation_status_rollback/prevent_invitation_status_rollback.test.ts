import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './prevent_invitation_status_rollback.data.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './prevent_invitation_status_rollback.fixture.ts';

describe('Trigger: trigger_prevent_invitation_status_rollback', () => {
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

  it('should prevent changing status from accepted to pending', async () => {
    const fixture = await fixtureBuilder.createInvitationWithStatus('accepted');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.pending })
      .eq('id', fixture.invitationId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Cannot change invitation status') &&
        updateError.message.includes('pending'),
      true
    );
  });

  it('should prevent changing status from declined to pending', async () => {
    const fixture = await fixtureBuilder.createInvitationWithStatus('declined');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.pending })
      .eq('id', fixture.invitationId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Cannot change invitation status') &&
        updateError.message.includes('pending'),
      true
    );
  });

  it('should allow changing status from pending to accepted', async () => {
    const fixture = await fixtureBuilder.createInvitationWithStatus('pending');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.accepted })
      .eq('id', fixture.invitationId);

    assertEquals(updateError, null);
  });

  it('should allow changing status from pending to declined', async () => {
    const fixture = await fixtureBuilder.createInvitationWithStatus('pending');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.declined })
      .eq('id', fixture.invitationId);

    assertEquals(updateError, null);
  });

  it('should allow changing status from accepted to declined', async () => {
    const fixture = await fixtureBuilder.createInvitationWithStatus('accepted');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.declined })
      .eq('id', fixture.invitationId);

    assertEquals(updateError, null);
  });

  it('should allow changing status from declined to accepted', async () => {
    const fixture = await fixtureBuilder.createInvitationWithStatus('declined');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ status: TriggerTestData.invitationStatuses.accepted })
      .eq('id', fixture.invitationId);

    assertEquals(updateError, null);
  });

  it('should allow updating other fields without changing status', async () => {
    const fixture = await fixtureBuilder.createInvitationWithStatus('accepted');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('structure_invitations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', fixture.invitationId);

    assertEquals(updateError, null);
  });
});
