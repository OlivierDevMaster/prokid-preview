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

  console.log(`📋 Found ${missions.length} pending mission(s) to accept\n`);

  let acceptedCount = 0;
  let errorCount = 0;

  for (const mission of missions) {
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
  console.log(`   📋 Total: ${missions.length}`);
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

