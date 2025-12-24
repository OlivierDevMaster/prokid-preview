import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './prevent_mission_status_rollback.data.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './prevent_mission_status_rollback.fixture.ts';

describe('Trigger: trigger_prevent_mission_status_rollback', () => {
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
    const fixture = await fixtureBuilder.createMissionWithStatus('accepted');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.pending })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Cannot change mission status') &&
        updateError.message.includes('pending'),
      true
    );
  });

  it('should prevent changing status from declined to pending', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('declined');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.pending })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Cannot change mission status') &&
        updateError.message.includes('pending'),
      true
    );
  });

  it('should allow changing status from pending to accepted', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('pending');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.accepted })
      .eq('id', fixture.missionId);

    assertEquals(updateError, null);
  });

  it('should allow changing status from pending to declined', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('pending');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.declined })
      .eq('id', fixture.missionId);

    assertEquals(updateError, null);
  });

  it('should prevent changing status from accepted to declined', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('accepted');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.declined })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes(
        'Cannot change mission status from accepted to declined'
      ),
      true
    );
  });

  it('should prevent changing status from declined to accepted', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('declined');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.accepted })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes(
        'Cannot change mission status from declined to accepted'
      ),
      true
    );
  });

  it('should allow updating other fields without changing status', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('accepted');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ title: 'Updated Title' })
      .eq('id', fixture.missionId);

    assertEquals(updateError, null);
  });

  it('should prevent changing status from expired to any other status', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('expired');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.pending })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Cannot change mission status from expired'),
      true
    );
  });

  it('should prevent changing status from expired to accepted', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('expired');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.accepted })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Cannot change mission status from expired'),
      true
    );
  });

  it('should prevent changing status from expired to declined', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('expired');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.declined })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Cannot change mission status from expired'),
      true
    );
  });

  it('should prevent changing status from accepted to expired', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('accepted');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.expired })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes(
        'Cannot change mission status from accepted to expired'
      ) || updateError.message.includes('Only pending missions can be expired'),
      true
    );
  });

  it('should prevent changing status from declined to expired', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('declined');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.expired })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes(
        'Cannot change mission status from declined to expired'
      ) || updateError.message.includes('Only pending missions can be expired'),
      true
    );
  });

  it('should prevent changing status from cancelled to expired', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('cancelled');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.expired })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes(
        'Cannot change mission status from cancelled to expired'
      ) || updateError.message.includes('Only pending missions can be expired'),
      true
    );
  });

  it('should allow changing status from pending to expired', async () => {
    const fixture = await fixtureBuilder.createMissionWithStatus('pending');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ status: TriggerTestData.missionStatuses.expired })
      .eq('id', fixture.missionId);

    assertEquals(updateError, null);
  });
});
