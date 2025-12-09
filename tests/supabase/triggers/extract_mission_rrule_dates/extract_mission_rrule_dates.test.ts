import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './extract_mission_rrule_dates.data.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './extract_mission_rrule_dates.fixture.ts';

describe('Trigger: extract_mission_rrule_dates', () => {
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

  it('should extract dtstart and until on INSERT when both are present', async () => {
    const fixture = await fixtureBuilder.createMissionWithRrule(
      TriggerTestData.rruleFormats.withDtstartAndUntil
    );
    fixtures.push(fixture);

    const { data: mission, error } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(error, null);
    assertExists(mission);
    assertExists(mission.dtstart);
    assertExists(mission.until);

    const dtstart = new Date(mission.dtstart);
    const until = new Date(mission.until);

    assertEquals(
      dtstart.getTime(),
      TriggerTestData.expectedDates.dtstart20240101.getTime()
    );
    assertEquals(
      until.getTime(),
      TriggerTestData.expectedDates.until20240131.getTime()
    );
  });

  it('should extract only dtstart on INSERT when UNTIL is missing', async () => {
    const fixture = await fixtureBuilder.createMissionWithRrule(
      TriggerTestData.rruleFormats.withDtstartOnly
    );
    fixtures.push(fixture);

    const { data: mission, error } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(error, null);
    assertExists(mission);
    assertExists(mission.dtstart);
    assertEquals(mission.until, null);

    const dtstart = new Date(mission.dtstart);
    assertEquals(
      dtstart.getTime(),
      TriggerTestData.expectedDates.dtstart20240101.getTime()
    );
  });

  it('should set dtstart and until to NULL on INSERT when both are missing', async () => {
    const fixture = await fixtureBuilder.createMissionWithRrule(
      TriggerTestData.rruleFormats.withoutDates
    );
    fixtures.push(fixture);

    const { data: mission, error } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(error, null);
    assertExists(mission);
    assertEquals(mission.dtstart, null);
    assertEquals(mission.until, null);
  });

  it('should set dtstart to NULL on INSERT when DTSTART format is invalid', async () => {
    const fixture = await fixtureBuilder.createMissionWithRrule(
      TriggerTestData.rruleFormats.invalidDtstart
    );
    fixtures.push(fixture);

    const { data: mission, error } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(error, null);
    assertExists(mission);
    assertEquals(mission.dtstart, null);
  });

  it('should set until to NULL on INSERT when UNTIL format is invalid', async () => {
    const fixture = await fixtureBuilder.createMissionWithRrule(
      TriggerTestData.rruleFormats.invalidUntil
    );
    fixtures.push(fixture);

    const { data: mission, error } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(error, null);
    assertExists(mission);
    assertExists(mission.dtstart);
    assertEquals(mission.until, null);
  });

  it('should extract dtstart and until on INSERT when dates are without Z suffix', async () => {
    const fixture = await fixtureBuilder.createMissionWithRrule(
      TriggerTestData.rruleFormats.dtstartWithoutZ
    );
    fixtures.push(fixture);

    const { data: mission, error } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(error, null);
    assertExists(mission);
    assertExists(mission.dtstart);
    assertExists(mission.until);

    const dtstart = new Date(mission.dtstart);
    const until = new Date(mission.until);

    assertEquals(
      dtstart.getTime(),
      TriggerTestData.expectedDates.dtstart20240101.getTime()
    );
    assertEquals(
      until.getTime(),
      TriggerTestData.expectedDates.until20240131.getTime()
    );
  });

  it('should update dtstart and until on UPDATE of rrule', async () => {
    const fixture = await fixtureBuilder.createMissionWithRrule(
      TriggerTestData.rruleFormats.withDtstartAndUntil
    );
    fixtures.push(fixture);

    const newRrule = `DTSTART:20240201T100000Z
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`;

    const { error: updateError } = await adminClient
      .from('missions')
      .update({ rrule: newRrule })
      .eq('id', fixture.missionId);

    assertEquals(updateError, null);

    const { data: mission, error } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(error, null);
    assertExists(mission);
    assertExists(mission.dtstart);
    assertEquals(mission.until, null);

    const dtstart = new Date(mission.dtstart);
    assertEquals(
      dtstart.getTime(),
      TriggerTestData.expectedDates.dtstart20240201.getTime()
    );
  });

  it('should not update dtstart and until on UPDATE of other fields', async () => {
    const fixture = await fixtureBuilder.createMissionWithRrule(
      TriggerTestData.rruleFormats.withDtstartAndUntil
    );
    fixtures.push(fixture);

    const { data: missionBefore, error: errorBefore } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(errorBefore, null);
    assertExists(missionBefore);

    const { error: updateError } = await adminClient
      .from('missions')
      .update({
        description: 'Updated description',
        status: 'accepted',
        title: 'Updated Title',
      })
      .eq('id', fixture.missionId);

    assertEquals(updateError, null);

    const { data: missionAfter, error: errorAfter } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(errorAfter, null);
    assertExists(missionAfter);

    assertEquals(missionBefore.dtstart, missionAfter.dtstart);
    assertEquals(missionBefore.until, missionAfter.until);
  });

  it('should use first DTSTART when multiple DTSTART lines are present', async () => {
    const fixture = await fixtureBuilder.createMissionWithRrule(
      TriggerTestData.rruleFormats.multipleDtstart
    );
    fixtures.push(fixture);

    const { data: mission, error } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(error, null);
    assertExists(mission);
    assertExists(mission.dtstart);

    const dtstart = new Date(mission.dtstart);
    assertEquals(
      dtstart.getTime(),
      TriggerTestData.expectedDates.dtstart20240101.getTime()
    );
  });

  it('should use first UNTIL when multiple UNTIL lines are present', async () => {
    const fixture = await fixtureBuilder.createMissionWithRrule(
      TriggerTestData.rruleFormats.multipleUntil
    );
    fixtures.push(fixture);

    const { data: mission, error } = await adminClient
      .from('missions')
      .select('dtstart, until')
      .eq('id', fixture.missionId)
      .single();

    assertEquals(error, null);
    assertExists(mission);
    assertExists(mission.dtstart);
    assertExists(mission.until);

    const until = new Date(mission.until);
    assertEquals(
      until.getTime(),
      TriggerTestData.expectedDates.until20240131.getTime()
    );
  });
});
