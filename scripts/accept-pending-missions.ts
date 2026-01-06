import { createClient } from '@supabase/supabase-js';

import { Database } from '../types/database/schema';

import {
  type MissionSchedule,
  type ProfessionalAvailability,
  updateAvailabilitiesForMissions,
} from './update-availabilities-for-missions/updateAvailabilitiesForMissions';

/**
 * Script to accept all pending missions after seeding
 *
 * This script replicates the logic from acceptMissionHandler but without
 * authentication checks, since it's run as a post-seed operation.
 *
 * IMPORTANT: This script excludes the last 2 pending missions per professional
 * to keep them pending for manual testing (accept/decline).
 *
 * Usage:
 *   npm run db:accept-pending-missions
 *   OR: npx dotenvx run -- tsx scripts/accept-pending-missions.ts
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function acceptPendingMissions() {
  console.log('🔄 Accepting pending missions...\n');

  // Fetch all pending missions with their schedules
  const { data: missions, error: missionsError } = await supabase
    .from('missions')
    .select(
      `
      id,
      professional_id,
      mission_dtstart,
      mission_until,
      status,
      mission_schedules (
        rrule,
        duration_mn
      )
    `
    )
    .eq('status', 'pending')
    .order('mission_dtstart', { ascending: true });

  if (missionsError) {
    console.error('❌ Error fetching missions:', missionsError);
    process.exit(1);
  }

  if (!missions || missions.length === 0) {
    console.log('✅ No pending missions to accept.');
    return;
  }

  // Group missions by professional_id and exclude the last 2 per professional
  // (These are kept pending for manual testing)
  const missionsByProfessional = new Map<
    string,
    Array<(typeof missions)[0]>
  >();

  for (const mission of missions) {
    const professionalId = mission.professional_id;
    if (!missionsByProfessional.has(professionalId)) {
      missionsByProfessional.set(professionalId, []);
    }
    missionsByProfessional.get(professionalId)!.push(mission);
  }

  // For each professional, sort by mission_dtstart (ascending) and exclude last 2
  const missionsToAccept: Array<(typeof missions)[0]> = [];
  const missionsToKeepPending: Array<(typeof missions)[0]> = [];

  for (const [professionalId, professionalMissions] of missionsByProfessional) {
    // Sort by mission_dtstart (ascending) - most recent at the end
    const sorted = [...professionalMissions].sort(
      (a, b) =>
        new Date(a.mission_dtstart).getTime() -
        new Date(b.mission_dtstart).getTime()
    );

    // Keep last 2 pending, accept the rest
    const toKeepPending = sorted.slice(-2);
    const toAccept = sorted.slice(0, -2);

    missionsToAccept.push(...toAccept);
    missionsToKeepPending.push(...toKeepPending);
  }

  console.log(
    `📋 Found ${missions.length} pending mission(s) total:`
  );
  console.log(`   ✅ Will accept: ${missionsToAccept.length}`);
  console.log(
    `   ⏸️  Will keep pending (for testing): ${missionsToKeepPending.length}\n`
  );

  if (missionsToAccept.length === 0) {
    console.log('✅ No missions to accept (all are kept pending for testing).');
    return;
  }

  let acceptedCount = 0;
  let errorCount = 0;

  for (const mission of missionsToAccept) {
    try {
      console.log(`🎯 Processing mission ${mission.id}...`);

      if (!mission.mission_schedules || mission.mission_schedules.length === 0) {
        console.warn(`   ⚠️  Mission has no schedules, skipping`);
        errorCount++;
        continue;
      }

      // Get professional availabilities
      const { data: availabilities, error: availabilitiesError } =
        await supabase
          .from('availabilities')
          .select('id, rrule, duration_mn')
          .eq('user_id', mission.professional_id);

      if (availabilitiesError) {
        console.error(
          `   ❌ Error fetching availabilities:`,
          availabilitiesError
        );
        errorCount++;
        continue;
      }

      // Convert mission schedules to the format expected by updateAvailabilitiesForMissions
      const missionSchedulesForUpdate: MissionSchedule[] = (
        mission.mission_schedules as Array<{
          rrule: string;
          duration_mn: number;
        }>
      ).map(schedule => ({
        duration_mn: schedule.duration_mn,
        rrule: schedule.rrule,
      }));

      // Convert availabilities to the format expected by updateAvailabilitiesForMissions
      const professionalAvailabilities: ProfessionalAvailability[] = (
        availabilities || []
      ).map(availability => ({
        duration_mn: availability.duration_mn,
        rrule: availability.rrule,
      }));

      // Calculate which availabilities need to be updated or created
      const availabilityUpdates = updateAvailabilitiesForMissions(
        professionalAvailabilities,
        missionSchedulesForUpdate,
        new Date(mission.mission_dtstart),
        new Date(mission.mission_until)
      );

      // Update existing availabilities
      for (const update of availabilityUpdates.toUpdate) {
        const originalAvailability = (availabilities || []).find(
          a =>
            a.rrule === update.originalAvailability.rrule &&
            a.duration_mn === update.originalAvailability.duration_mn
        );
        if (!originalAvailability) continue;

        const { error: updateError } = await supabase
          .from('availabilities')
          .update({
            duration_mn:
              update.newDurationMn || originalAvailability.duration_mn,
            rrule: update.newRrule,
          })
          .eq('id', originalAvailability.id);

        if (updateError) {
          console.error(
            `   ❌ Error updating availability ${originalAvailability.id}:`,
            updateError
          );
        }
      }

      // Create new availabilities
      for (const create of availabilityUpdates.toCreate) {
        const { error: createError } = await supabase
          .from('availabilities')
          .insert({
            duration_mn: create.duration_mn,
            rrule: create.rrule,
            user_id: mission.professional_id,
          });

        if (createError) {
          console.error(`   ❌ Error creating availability:`, createError);
        }
      }

      // Update mission status
      const { error: updateError } = await supabase
        .from('missions')
        .update({ status: 'accepted' })
        .eq('id', mission.id);

      if (updateError) {
        console.error(`   ❌ Error updating mission:`, updateError);
        errorCount++;
        continue;
      }

      console.log(`   ✅ Accepted mission ${mission.id}`);
      acceptedCount++;
    } catch (error) {
      console.error(`   ❌ Error processing mission ${mission.id}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Accepted: ${acceptedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📋 Processed: ${missionsToAccept.length}`);
  console.log(
    `   ⏸️  Kept pending (for testing): ${missionsToKeepPending.length}`
  );
}

acceptPendingMissions()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

