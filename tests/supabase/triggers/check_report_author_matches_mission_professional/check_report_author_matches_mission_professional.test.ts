import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './check_report_author_matches_mission_professional.fixture.ts';

describe('Trigger: check_report_author_matches_mission_professional', () => {
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

  it('should allow creating report when author matches mission professional', async () => {
    const fixture = await fixtureBuilder.createMissionWithProfessional();
    fixtures.push(fixture);

    const { data: reportData, error: reportError } = await adminClient
      .from('reports')
      .insert({
        author_id: fixture.professionalId,
        content: 'Test report content',
        mission_id: fixture.missionId,
        status: 'draft',
        title: 'Test Report',
      })
      .select('id')
      .single();

    assertEquals(reportError, null);
    assertExists(reportData);

    if (reportData) {
      fixture.reportId = reportData.id;
    }
  });

  it('should prevent creating report when author does not match mission professional', async () => {
    const fixture = await fixtureBuilder.createMissionWithProfessional();
    fixtures.push(fixture);

    const otherProfessionalFixture = await fixtureBuilder.createProfessional();
    fixtures.push(otherProfessionalFixture);

    if (!otherProfessionalFixture.professionalToken) {
      throw new Error('Professional token not available');
    }

    const professionalClient = supabaseClient.createAuthenticatedClient(
      otherProfessionalFixture.professionalToken
    );

    const { error: reportError } = await professionalClient
      .from('reports')
      .insert({
        author_id: otherProfessionalFixture.professionalId,
        content: 'Test report content',
        mission_id: fixture.missionId,
        status: 'draft',
        title: 'Test Report',
      });

    assertExists(reportError);
    assertEquals(
      reportError.message.includes('is not assigned to mission'),
      true
    );
  });

  it('should prevent updating report author to non-assigned professional', async () => {
    const fixture = await fixtureBuilder.createReport();
    fixtures.push(fixture);

    const otherProfessionalFixture = await fixtureBuilder.createProfessional();
    fixtures.push(otherProfessionalFixture);

    if (!fixture.professionalToken) {
      throw new Error('Professional token not available');
    }

    const professionalClient = supabaseClient.createAuthenticatedClient(
      fixture.professionalToken
    );

    const { error: updateError } = await professionalClient
      .from('reports')
      .update({ author_id: otherProfessionalFixture.professionalId })
      .eq('id', fixture.reportId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('is not assigned to mission'),
      true
    );
  });

  it('should prevent updating report mission to one where author is not assigned', async () => {
    const fixture = await fixtureBuilder.createReport();
    fixtures.push(fixture);

    const otherMissionFixture =
      await fixtureBuilder.createMissionWithDifferentProfessional();
    fixtures.push(otherMissionFixture);

    if (!fixture.professionalToken) {
      throw new Error('Professional token not available');
    }

    const professionalClient = supabaseClient.createAuthenticatedClient(
      fixture.professionalToken
    );

    const { error: updateError } = await professionalClient
      .from('reports')
      .update({ mission_id: otherMissionFixture.missionId })
      .eq('id', fixture.reportId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('is not assigned to mission'),
      true
    );
  });

  it('should allow updating other fields without validation', async () => {
    const fixture = await fixtureBuilder.createReport();
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('reports')
      .update({ content: 'Updated content', title: 'Updated Title' })
      .eq('id', fixture.reportId);

    assertEquals(updateError, null);
  });
});
