import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './prevent_status_rollback_from_sent.data.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './prevent_status_rollback_from_sent.fixture.ts';

describe('Trigger: prevent_status_rollback_from_sent', () => {
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

  it('should prevent changing status from sent to draft', async () => {
    const fixture = await fixtureBuilder.createReportWithStatus('sent');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('reports')
      .update({ status: TriggerTestData.reportStatuses.draft })
      .eq('id', fixture.reportId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('Cannot change report status from sent') &&
        updateError.message.includes('draft'),
      true
    );
  });

  it('should allow changing status from draft to sent', async () => {
    const fixture = await fixtureBuilder.createReportWithStatus('draft');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('reports')
      .update({ status: TriggerTestData.reportStatuses.sent })
      .eq('id', fixture.reportId);

    assertEquals(updateError, null);
  });

  it('should allow updating other fields without changing status', async () => {
    const fixture = await fixtureBuilder.createReportWithStatus('sent');
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('reports')
      .update({ content: 'Updated content', title: 'Updated Title' })
      .eq('id', fixture.reportId);

    assertEquals(updateError, null);
  });
});
