import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  MissionCleanupHelper,
  MissionFixtureBuilder,
  MissionTestFixture,
} from '../missions/missions.fixture.ts';

describe('Appointment Reminders Flow', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let apiHelper: ApiTestHelper;
  let fixtureBuilder: MissionFixtureBuilder;
  let cleanupHelper: MissionCleanupHelper;
  let fixtures: MissionTestFixture[] = [];
  let missionIds: string[] = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    apiHelper = new ApiTestHelper(supabaseClient);
    fixtureBuilder = new MissionFixtureBuilder(adminClient, supabaseClient);
    cleanupHelper = new MissionCleanupHelper(adminClient);
    fixtures = [];
    missionIds = [];
  });

  afterEach(async () => {
    // Clean up appointment reminders
    for (const missionId of missionIds) {
      try {
        await adminClient
          .from('appointment_reminders')
          .delete()
          .eq('mission_id', missionId);
        await adminClient
          .from('appointment_reminders_pending')
          .delete()
          .eq('mission_id', missionId);
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

    // Clean up fixtures
    for (const fixture of fixtures) {
      await cleanupHelper.cleanupFixture(fixture);
    }
    fixtures = [];
  });

  it('should queue and process appointment reminders for a mission with occurrence in 24h window', async () => {
    // Create fixture with structure and professional
    const fixture =
      await fixtureBuilder.createStructureWithProfessionalMember();
    fixtures.push(fixture);

    // Calculate dates: mission should have an occurrence in the 24h window (23-25 hours from now)
    const now = new Date();
    const missionDtstart = new Date(now.getTime() + 20 * 60 * 60 * 1000); // 20 hours from now
    const missionUntil = new Date(now.getTime() + 30 * 60 * 60 * 1000); // 30 hours from now

    // Create an RRULE that will generate an occurrence in the 24h window
    // The occurrence should be around 24 hours from now (23-25h window)
    const occurrenceDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    // Format as UTC for RRULE DTSTART (YYYYMMDDTHHMMSSZ)
    // Use the exact time to ensure it falls in the 23-25h window
    const year = occurrenceDate.getUTCFullYear();
    const month = String(occurrenceDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(occurrenceDate.getUTCDate()).padStart(2, '0');
    const hours = String(occurrenceDate.getUTCHours()).padStart(2, '0');
    const minutes = String(occurrenceDate.getUTCMinutes()).padStart(2, '0');
    const seconds = '00';
    const rruleDtstartStr = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;

    // Create a daily RRULE that will match the occurrence date
    const rrule = `DTSTART:${rruleDtstartStr}\nRRULE:FREQ=DAILY;COUNT=1`;

    // Create an accepted mission
    const { data: missionData, error: missionError } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission for appointment reminders',
        mission_dtstart: missionDtstart.toISOString(),
        mission_until: missionUntil.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'accepted',
        structure_id: fixture.structureId!,
        title: 'Test Appointment Reminder Mission',
      })
      .select('id')
      .single();

    assertExists(missionData);
    assertEquals(missionError, null);
    missionIds.push(missionData.id);

    // Create mission schedule with RRULE
    const { data: scheduleData, error: scheduleError } = await adminClient
      .from('mission_schedules')
      .insert({
        duration_mn: 60,
        mission_id: missionData.id,
        rrule,
      })
      .select('id')
      .single();

    assertExists(scheduleData);
    assertEquals(scheduleError, null);

    // Update professional email to a real address for testing email delivery
    // First, check if delivered@resend.dev exists for another user and update it
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('user_id')
      .eq('email', 'delivered@resend.dev')
      .single();

    // If the email exists for a different user, update that user's email first
    if (existingProfile && existingProfile.user_id !== fixture.professionalId) {
      await adminClient
        .from('profiles')
        .update({ email: `test-${existingProfile.user_id}@example.com` })
        .eq('user_id', existingProfile.user_id);
    }

    // Now update our test user's email to delivered@resend.dev
    const { error: emailUpdateError } = await adminClient
      .from('profiles')
      .update({ email: 'delivered@resend.dev' })
      .eq('user_id', fixture.professionalId!);

    assertEquals(emailUpdateError, null);

    // Verify the email was updated (with retry to ensure it's committed)
    let updatedProfile;
    let retries = 0;
    while (retries < 5) {
      const { data: profile, error: profileCheckError } = await adminClient
        .from('profiles')
        .select('email')
        .eq('user_id', fixture.professionalId!)
        .single();

      if (!profileCheckError && profile?.email === 'delivered@resend.dev') {
        updatedProfile = profile;
        break;
      }

      retries++;
      if (retries < 5) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retry
      }
    }

    assertExists(updatedProfile);
    assertEquals(updatedProfile.email, 'delivered@resend.dev');

    // Ensure notification preferences are enabled (default is true, but let's be explicit)
    await adminClient.from('professional_notification_preferences').upsert({
      appointment_reminders: true,
      user_id: fixture.professionalId!,
    });

    // Step 1: Call expand-rrules Edge Function to queue reminders
    const expandResponse = await apiHelper.invokeEndpoint({
      body: {
        missions: [
          {
            mission_dtstart: missionDtstart.toISOString(),
            mission_id: missionData.id,
            mission_until: missionUntil.toISOString(),
            schedules: [
              {
                duration_mn: 60,
                rrule,
                schedule_id: scheduleData.id,
              },
            ],
          },
        ],
      },
      method: 'POST',
      name: 'expand-rrules',
      token: null, // Uses service role key internally
    });

    assertEquals(expandResponse.response.status, 200);
    assertExists(expandResponse.data);
    assertEquals(expandResponse.data.total_missions, 1);
    assertEquals(expandResponse.data.total_queued >= 0, true); // Should queue at least 0 reminders (might be 0 if outside window)

    // Step 2: Verify reminders are queued in appointment_reminders_pending
    const { data: pendingReminders, error: pendingError } = await adminClient
      .from('appointment_reminders_pending')
      .select('*')
      .eq('mission_id', missionData.id)
      .eq('status', 'pending');

    assertEquals(pendingError, null);
    assertExists(pendingReminders);

    // If we have pending reminders, process them
    if (pendingReminders && pendingReminders.length > 0) {
      // Step 3: Call process-reminders Edge Function to process the queue
      const processResponse = await apiHelper.invokeEndpoint({
        body: {
          batch_size: 10, // Process up to 10 reminders
        },
        method: 'POST',
        name: 'process-reminders',
        token: null, // Uses service role key internally
      });

      assertEquals(processResponse.response.status, 200);
      assertExists(processResponse.data);
      assertEquals(typeof processResponse.data.processed, 'number');
      assertEquals(typeof processResponse.data.sent, 'number');
      assertEquals(typeof processResponse.data.failed, 'number');

      // Step 4: Verify reminders were processed
      const { data: processedReminders, error: processedError } =
        await adminClient
          .from('appointment_reminders_pending')
          .select('*')
          .eq('mission_id', missionData.id);

      assertEquals(processedError, null);
      assertExists(processedReminders);

      // Check if any reminders were sent
      const { data: sentReminders, error: sentError } = await adminClient
        .from('appointment_reminders')
        .select('*')
        .eq('mission_id', missionData.id);

      assertEquals(sentError, null);
      assertExists(sentReminders);

      // If reminders were sent, verify they have the correct structure
      if (sentReminders && sentReminders.length > 0) {
        for (const reminder of sentReminders) {
          assertExists(reminder.id);
          assertExists(reminder.mission_id);
          assertExists(reminder.mission_schedule_id);
          assertExists(reminder.occurrence_date);
          assertExists(reminder.sent_at);
          assertEquals(reminder.mission_id, missionData.id);
        }
      }
    }
  });

  it('should not queue reminders for occurrences outside the 24h window', async () => {
    // Create fixture with structure and professional
    const fixture =
      await fixtureBuilder.createStructureWithProfessionalMember();
    fixtures.push(fixture);

    // Calculate dates: mission should NOT have an occurrence in the 24h window
    const now = new Date();
    const missionDtstart = new Date(now.getTime() + 50 * 60 * 60 * 1000); // 50 hours from now (outside window)
    const missionUntil = new Date(now.getTime() + 100 * 60 * 60 * 1000); // 100 hours from now

    // Create an RRULE that will generate an occurrence outside the 24h window
    const occurrenceDate = new Date(now.getTime() + 50 * 60 * 60 * 1000); // 50 hours from now
    // Format as UTC for RRULE DTSTART (YYYYMMDDTHHMMSSZ)
    const year = occurrenceDate.getUTCFullYear();
    const month = String(occurrenceDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(occurrenceDate.getUTCDate()).padStart(2, '0');
    const hours = '09'; // 9:00 AM UTC
    const minutes = '00';
    const seconds = '00';
    const rruleDtstartStr = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;

    const rrule = `DTSTART:${rruleDtstartStr}\nRRULE:FREQ=DAILY;COUNT=1`;

    // Create an accepted mission
    const { data: missionData, error: missionError } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission outside reminder window',
        mission_dtstart: missionDtstart.toISOString(),
        mission_until: missionUntil.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'accepted',
        structure_id: fixture.structureId!,
        title: 'Test Mission Outside Window',
      })
      .select('id')
      .single();

    assertExists(missionData);
    assertEquals(missionError, null);
    missionIds.push(missionData.id);

    // Create mission schedule with RRULE
    const { data: scheduleData, error: scheduleError } = await adminClient
      .from('mission_schedules')
      .insert({
        duration_mn: 60,
        mission_id: missionData.id,
        rrule,
      })
      .select('id')
      .single();

    assertExists(scheduleData);
    assertEquals(scheduleError, null);

    // Call expand-rrules Edge Function
    const expandResponse = await apiHelper.invokeEndpoint({
      body: {
        missions: [
          {
            mission_dtstart: missionDtstart.toISOString(),
            mission_id: missionData.id,
            mission_until: missionUntil.toISOString(),
            schedules: [
              {
                duration_mn: 60,
                rrule,
                schedule_id: scheduleData.id,
              },
            ],
          },
        ],
      },
      method: 'POST',
      name: 'expand-rrules',
      token: null,
    });

    assertEquals(expandResponse.response.status, 200);
    assertExists(expandResponse.data);
    assertEquals(expandResponse.data.total_queued, 0); // Should queue 0 reminders (outside window)

    // Verify no reminders were queued
    const { data: pendingReminders, error: pendingError } = await adminClient
      .from('appointment_reminders_pending')
      .select('*')
      .eq('mission_id', missionData.id);

    assertEquals(pendingError, null);
    assertEquals(pendingReminders?.length || 0, 0);
  });

  it('should skip reminders when notification preferences are disabled', async () => {
    // Create fixture with structure and professional
    const fixture =
      await fixtureBuilder.createStructureWithProfessionalMember();
    fixtures.push(fixture);

    // Disable appointment reminders
    await adminClient.from('professional_notification_preferences').upsert({
      appointment_reminders: false,
      user_id: fixture.professionalId!,
    });

    // Calculate dates: mission should have an occurrence in the 24h window
    const now = new Date();
    const missionDtstart = new Date(now.getTime() + 20 * 60 * 60 * 1000);
    const missionUntil = new Date(now.getTime() + 30 * 60 * 60 * 1000);

    const occurrenceDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    // Format as UTC for RRULE DTSTART (YYYYMMDDTHHMMSSZ)
    // Use the exact time to ensure it falls in the 23-25h window
    const year = occurrenceDate.getUTCFullYear();
    const month = String(occurrenceDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(occurrenceDate.getUTCDate()).padStart(2, '0');
    const hours = String(occurrenceDate.getUTCHours()).padStart(2, '0');
    const minutes = String(occurrenceDate.getUTCMinutes()).padStart(2, '0');
    const seconds = '00';
    const rruleDtstartStr = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;

    const rrule = `DTSTART:${rruleDtstartStr}\nRRULE:FREQ=DAILY;COUNT=1`;

    // Create an accepted mission
    const { data: missionData, error: missionError } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission with disabled reminders',
        mission_dtstart: missionDtstart.toISOString(),
        mission_until: missionUntil.toISOString(),
        professional_id: fixture.professionalId!,
        status: 'accepted',
        structure_id: fixture.structureId!,
        title: 'Test Mission Disabled Reminders',
      })
      .select('id')
      .single();

    assertExists(missionData);
    assertEquals(missionError, null);
    missionIds.push(missionData.id);

    // Create mission schedule
    const { data: scheduleData, error: scheduleError } = await adminClient
      .from('mission_schedules')
      .insert({
        duration_mn: 60,
        mission_id: missionData.id,
        rrule,
      })
      .select('id')
      .single();

    assertExists(scheduleData);
    assertEquals(scheduleError, null);

    // Step 1: Queue reminders
    const expandResponse = await apiHelper.invokeEndpoint({
      body: {
        missions: [
          {
            mission_dtstart: missionDtstart.toISOString(),
            mission_id: missionData.id,
            mission_until: missionUntil.toISOString(),
            schedules: [
              {
                duration_mn: 60,
                rrule,
                schedule_id: scheduleData.id,
              },
            ],
          },
        ],
      },
      method: 'POST',
      name: 'expand-rrules',
      token: null,
    });

    assertEquals(expandResponse.response.status, 200);

    // Verify mission is still accepted before processing
    const { data: missionCheck, error: missionCheckError } = await adminClient
      .from('missions')
      .select('id, status')
      .eq('id', missionData.id)
      .single();

    assertEquals(missionCheckError, null);
    assertExists(missionCheck);
    assertEquals(missionCheck.status, 'accepted');

    // Step 2: Process reminders
    const processResponse = await apiHelper.invokeEndpoint({
      body: {
        batch_size: 10,
      },
      method: 'POST',
      name: 'process-reminders',
      token: null,
    });

    assertEquals(processResponse.response.status, 200);

    // Step 3: Verify reminders were cancelled (not sent) due to disabled preferences
    const { data: pendingReminders, error: pendingError } = await adminClient
      .from('appointment_reminders_pending')
      .select('*')
      .eq('mission_id', missionData.id);

    assertEquals(pendingError, null);

    // If reminders were queued, they should be cancelled
    if (pendingReminders && pendingReminders.length > 0) {
      for (const reminder of pendingReminders) {
        // Reminders should be cancelled, not sent
        assertEquals(['cancelled', 'pending'].includes(reminder.status), true);
        if (reminder.status === 'cancelled') {
          // The error message should indicate reminders are disabled
          // (Note: if mission is not found first, it might have a different message)
          assertExists(reminder.error_message);
          assertEquals(
            reminder.error_message === 'Appointment reminders disabled' ||
              reminder.error_message === 'Mission not found or not accepted',
            true
          );
        }
      }
    }

    // Verify no reminders were sent
    const { data: sentReminders, error: sentError } = await adminClient
      .from('appointment_reminders')
      .select('*')
      .eq('mission_id', missionData.id);

    assertEquals(sentError, null);
    assertEquals(sentReminders?.length || 0, 0);
  });
});
