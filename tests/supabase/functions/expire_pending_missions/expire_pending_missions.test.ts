import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  MissionCleanupHelper,
  MissionFixtureBuilder,
  MissionTestFixture,
} from '../missions/missions.fixture.ts';

describe('Function: expire_pending_missions', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: MissionFixtureBuilder;
  let cleanupHelper: MissionCleanupHelper;
  let fixtures: MissionTestFixture[] = [];
  let missionIds: string[] = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new MissionFixtureBuilder(adminClient, supabaseClient);
    cleanupHelper = new MissionCleanupHelper(adminClient);
    fixtures = [];
    missionIds = [];
  });

  afterEach(async () => {
    // Clean up missions first
    for (const missionId of missionIds) {
      try {
        await adminClient
          .from('mission_schedules')
          .delete()
          .eq('mission_id', missionId);
        await adminClient.from('missions').delete().eq('id', missionId);
      } catch (error) {
        console.warn(`Failed to cleanup mission ${missionId}:`, error);
      }
    }
    missionIds = [];

    // Then clean up fixtures
    for (const fixture of fixtures) {
      await cleanupHelper.cleanupFixture(fixture);
    }
    fixtures = [];
  });

  it('should expire pending missions with past start dates', async () => {
    const fixture =
      await fixtureBuilder.createStructureWithProfessionalMember();
    fixtures.push(fixture);

    // Create a pending mission with a past start date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

    const { data: missionData, error: missionError } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission',
        mission_dtstart: pastDate.toISOString(),
        mission_until: futureDate.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'pending',
        structure_id: fixture.structureId!,
        title: 'Past Mission',
      })
      .select('id, status')
      .single();

    assertExists(missionData);
    assertEquals(missionError, null);
    assertEquals(missionData.status, 'pending');
    missionIds.push(missionData.id);

    // Call the expire function
    const { data: expiredCount, error: functionError } = await adminClient.rpc(
      'expire_pending_missions'
    );

    assertEquals(functionError, null);
    assertEquals(expiredCount, 1);

    // Verify the mission was expired
    const { data: updatedMission, error: fetchError } = await adminClient
      .from('missions')
      .select('id, status, updated_at')
      .eq('id', missionData.id)
      .single();

    assertEquals(fetchError, null);
    assertExists(updatedMission);
    assertEquals(updatedMission.status, 'expired');
    assertExists(updatedMission.updated_at);
  });

  it('should not expire pending missions with future start dates', async () => {
    const fixture =
      await fixtureBuilder.createStructureWithProfessionalMember();
    fixtures.push(fixture);

    // Create a pending mission with a future start date
    const futureStartDate = new Date();
    futureStartDate.setDate(futureStartDate.getDate() + 1); // Tomorrow
    const futureEndDate = new Date();
    futureEndDate.setDate(futureEndDate.getDate() + 30); // 30 days from now

    const { data: missionData, error: missionError } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission',
        mission_dtstart: futureStartDate.toISOString(),
        mission_until: futureEndDate.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'pending',
        structure_id: fixture.structureId!,
        title: 'Future Mission',
      })
      .select('id, status')
      .single();

    assertExists(missionData);
    assertEquals(missionError, null);
    assertEquals(missionData.status, 'pending');
    missionIds.push(missionData.id);

    // Call the expire function
    const { data: expiredCount, error: functionError } = await adminClient.rpc(
      'expire_pending_missions'
    );

    assertEquals(functionError, null);
    assertEquals(expiredCount, 0);

    // Verify the mission is still pending
    const { data: updatedMission, error: fetchError } = await adminClient
      .from('missions')
      .select('id, status')
      .eq('id', missionData.id)
      .single();

    assertEquals(fetchError, null);
    assertExists(updatedMission);
    assertEquals(updatedMission.status, 'pending');
  });

  it('should not expire non-pending missions', async () => {
    const fixture =
      await fixtureBuilder.createStructureWithProfessionalMember();
    fixtures.push(fixture);

    // Create an accepted mission with a past start date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

    const { data: missionData, error: missionError } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission',
        mission_dtstart: pastDate.toISOString(),
        mission_until: futureDate.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'accepted',
        structure_id: fixture.structureId!,
        title: 'Accepted Mission',
      })
      .select('id, status')
      .single();

    assertExists(missionData);
    assertEquals(missionError, null);
    assertEquals(missionData.status, 'accepted');
    missionIds.push(missionData.id);

    // Call the expire function
    const { data: expiredCount, error: functionError } = await adminClient.rpc(
      'expire_pending_missions'
    );

    assertEquals(functionError, null);
    assertEquals(expiredCount, 0);

    // Verify the mission is still accepted
    const { data: updatedMission, error: fetchError } = await adminClient
      .from('missions')
      .select('id, status')
      .eq('id', missionData.id)
      .single();

    assertEquals(fetchError, null);
    assertExists(updatedMission);
    assertEquals(updatedMission.status, 'accepted');
  });

  it('should expire multiple pending missions with past start dates', async () => {
    const fixture =
      await fixtureBuilder.createStructureWithProfessionalMember();
    fixtures.push(fixture);

    // Create multiple pending missions with past start dates
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

    const { data: mission1Data, error: mission1Error } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission 1',
        mission_dtstart: pastDate.toISOString(),
        mission_until: futureDate.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'pending',
        structure_id: fixture.structureId!,
        title: 'Past Mission 1',
      })
      .select('id, status')
      .single();

    assertEquals(mission1Error, null);
    assertExists(mission1Data);
    missionIds.push(mission1Data.id);

    const { data: mission2Data, error: mission2Error } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission 2',
        mission_dtstart: pastDate.toISOString(),
        mission_until: futureDate.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'pending',
        structure_id: fixture.structureId!,
        title: 'Past Mission 2',
      })
      .select('id, status')
      .single();

    assertEquals(mission2Error, null);
    assertExists(mission2Data);
    missionIds.push(mission2Data.id);

    // Call the expire function
    const { data: expiredCount, error: functionError } = await adminClient.rpc(
      'expire_pending_missions'
    );

    assertEquals(functionError, null);
    assertEquals(expiredCount, 2);

    // Verify both missions were expired
    const { data: updatedMission1, error: fetch1Error } = await adminClient
      .from('missions')
      .select('id, status')
      .eq('id', mission1Data.id)
      .single();

    assertEquals(fetch1Error, null);
    assertExists(updatedMission1);
    assertEquals(updatedMission1.status, 'expired');

    const { data: updatedMission2, error: fetch2Error } = await adminClient
      .from('missions')
      .select('id, status')
      .eq('id', mission2Data.id)
      .single();

    assertEquals(fetch2Error, null);
    assertExists(updatedMission2);
    assertEquals(updatedMission2.status, 'expired');
  });

  it('should only expire pending missions, not other statuses', async () => {
    const fixture =
      await fixtureBuilder.createStructureWithProfessionalMember();
    fixtures.push(fixture);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

    // Create missions with different statuses
    const { data: pendingMission, error: pendingError } = await adminClient
      .from('missions')
      .insert({
        description: 'Pending mission',
        mission_dtstart: pastDate.toISOString(),
        mission_until: futureDate.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'pending',
        structure_id: fixture.structureId!,
        title: 'Pending Mission',
      })
      .select('id, status')
      .single();

    assertEquals(pendingError, null);
    assertExists(pendingMission);
    missionIds.push(pendingMission.id);

    const { data: acceptedMission, error: acceptedError } = await adminClient
      .from('missions')
      .insert({
        description: 'Accepted mission',
        mission_dtstart: pastDate.toISOString(),
        mission_until: futureDate.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'accepted',
        structure_id: fixture.structureId!,
        title: 'Accepted Mission',
      })
      .select('id, status')
      .single();

    assertEquals(acceptedError, null);
    assertExists(acceptedMission);
    missionIds.push(acceptedMission.id);

    const { data: declinedMission, error: declinedError } = await adminClient
      .from('missions')
      .insert({
        description: 'Declined mission',
        mission_dtstart: pastDate.toISOString(),
        mission_until: futureDate.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'declined',
        structure_id: fixture.structureId!,
        title: 'Declined Mission',
      })
      .select('id, status')
      .single();

    assertEquals(declinedError, null);
    assertExists(declinedMission);
    missionIds.push(declinedMission.id);

    // Call the expire function
    const { data: expiredCount, error: functionError } = await adminClient.rpc(
      'expire_pending_missions'
    );

    assertEquals(functionError, null);
    assertEquals(expiredCount, 1);

    // Verify only pending mission was expired
    const { data: updatedPending, error: fetchPendingError } = await adminClient
      .from('missions')
      .select('id, status')
      .eq('id', pendingMission.id)
      .single();

    assertEquals(fetchPendingError, null);
    assertExists(updatedPending);
    assertEquals(updatedPending.status, 'expired');

    // Verify other missions were not changed
    const { data: updatedAccepted, error: fetchAcceptedError } =
      await adminClient
        .from('missions')
        .select('id, status')
        .eq('id', acceptedMission.id)
        .single();

    assertEquals(fetchAcceptedError, null);
    assertExists(updatedAccepted);
    assertEquals(updatedAccepted.status, 'accepted');

    const { data: updatedDeclined, error: fetchDeclinedError } =
      await adminClient
        .from('missions')
        .select('id, status')
        .eq('id', declinedMission.id)
        .single();

    assertEquals(fetchDeclinedError, null);
    assertExists(updatedDeclined);
    assertEquals(updatedDeclined.status, 'declined');
  });

  it('should update updated_at timestamp when expiring missions', async () => {
    const fixture =
      await fixtureBuilder.createStructureWithProfessionalMember();
    fixtures.push(fixture);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

    const { data: missionData, error: missionError } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission',
        mission_dtstart: pastDate.toISOString(),
        mission_until: futureDate.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'pending',
        structure_id: fixture.structureId!,
        title: 'Past Mission',
      })
      .select('id, status, updated_at')
      .single();

    assertExists(missionData);
    assertEquals(missionError, null);
    missionIds.push(missionData.id);
    const originalUpdatedAt = missionData.updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Call the expire function
    const { data: expiredCount, error: functionError } = await adminClient.rpc(
      'expire_pending_missions'
    );

    assertEquals(functionError, null);
    assertEquals(expiredCount, 1);

    // Verify updated_at was updated
    const { data: updatedMission, error: fetchError } = await adminClient
      .from('missions')
      .select('id, status, updated_at')
      .eq('id', missionData.id)
      .single();

    assertEquals(fetchError, null);
    assertExists(updatedMission);
    assertExists(updatedMission.updated_at);
    assertEquals(
      new Date(updatedMission.updated_at).getTime() >
        new Date(originalUpdatedAt).getTime(),
      true
    );
  });
});
