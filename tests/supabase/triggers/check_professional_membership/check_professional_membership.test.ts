import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './check_professional_membership.fixture.ts';

describe('Trigger: trigger_check_professional_membership', () => {
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

  it('should allow creating mission when professional is a member', async () => {
    const fixture = await fixtureBuilder.createStructureWithMember();
    fixtures.push(fixture);

    const rrule = `DTSTART:20240101T100000Z
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`;

    const { data: missionData, error: missionError } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission description',
        duration_mn: 240,
        professional_id: fixture.professionalId,
        rrule: rrule,
        status: 'pending',
        structure_id: fixture.structureId,
        title: 'Test Mission',
      })
      .select('id')
      .single();

    assertEquals(missionError, null);
    assertExists(missionData);

    if (missionData) {
      fixture.missionId = missionData.id;
    }
  });

  it('should prevent creating mission when professional is not a member', async () => {
    const fixture = await fixtureBuilder.createStructureWithoutMember();
    fixtures.push(fixture);

    const rrule = `DTSTART:20240101T100000Z
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`;

    const { error: missionError } = await adminClient.from('missions').insert({
      description: 'Test mission description',
      duration_mn: 240,
      professional_id: fixture.professionalId,
      rrule: rrule,
      status: 'pending',
      structure_id: fixture.structureId,
      title: 'Test Mission',
    });

    assertExists(missionError);
    assertEquals(
      missionError.message.includes('is not a member of structure'),
      true
    );
  });

  it('should prevent updating mission to assign non-member professional', async () => {
    const fixture = await fixtureBuilder.createMissionWithMember();
    fixtures.push(fixture);

    const nonMemberFixture =
      await fixtureBuilder.createStructureWithoutMember();
    fixtures.push(nonMemberFixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ professional_id: nonMemberFixture.professionalId })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('is not a member of structure'),
      true
    );
  });

  it('should allow updating mission to assign member professional', async () => {
    const fixture = await fixtureBuilder.createMissionWithMember();
    fixtures.push(fixture);

    const memberFixture = await fixtureBuilder.createStructureWithMember();
    fixtures.push(memberFixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ professional_id: memberFixture.professionalId })
      .eq('id', fixture.missionId);

    assertEquals(updateError, null);
  });

  it('should prevent updating mission structure when professional is not a member', async () => {
    const fixture = await fixtureBuilder.createMissionWithMember();
    fixtures.push(fixture);

    const otherStructureFixture =
      await fixtureBuilder.createStructureWithoutMember();
    fixtures.push(otherStructureFixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ structure_id: otherStructureFixture.structureId })
      .eq('id', fixture.missionId);

    assertExists(updateError);
    assertEquals(
      updateError.message.includes('is not a member of structure'),
      true
    );
  });

  it('should allow updating other fields without membership check', async () => {
    const fixture = await fixtureBuilder.createMissionWithMember();
    fixtures.push(fixture);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ title: 'Updated Title' })
      .eq('id', fixture.missionId);

    assertEquals(updateError, null);
  });
});
