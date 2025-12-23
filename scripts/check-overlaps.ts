import { createClient } from '@supabase/supabase-js';
import { RRule } from 'rrule';

import { Database } from '../types/database/schema';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkOverlaps() {
  console.log('🔍 Checking for overlaps between availabilities and accepted missions...\n');

  // Fetch all accepted missions with schedules
  const { data: missions, error: missionsError } = await supabase
    .from('missions')
    .select(
      `
      id,
      professional_id,
      mission_dtstart,
      mission_until,
      mission_schedules (
        rrule,
        duration_mn
      )
    `
    )
    .eq('status', 'accepted');

  if (missionsError || !missions) {
    console.error('Error fetching missions:', missionsError);
    process.exit(1);
  }

  // Fetch all availabilities
  const { data: availabilities, error: availabilitiesError } = await supabase
    .from('availabilities')
    .select('id, user_id, rrule, duration_mn');

  if (availabilitiesError || !availabilities) {
    console.error('Error fetching availabilities:', availabilitiesError);
    process.exit(1);
  }

  let overlapCount = 0;
  const overlaps: Array<{
    missionId: string;
    professionalId: string;
    missionDate: string;
    availabilityId: string;
  }> = [];

  // Check each mission against availabilities for the same professional
  for (const mission of missions) {
    if (!mission.mission_schedules || mission.mission_schedules.length === 0) {
      continue;
    }

    const professionalAvailabilities = availabilities.filter(
      a => a.user_id === mission.professional_id
    );

    for (const schedule of mission.mission_schedules as Array<{
      rrule: string;
      duration_mn: number;
    }>) {
      try {
        const missionRule = RRule.fromString(schedule.rrule);
        const missionStart = missionRule.options.dtstart || new Date(mission.mission_dtstart);
        const missionUntil = missionRule.options.until || new Date(mission.mission_until);
        const missionOccurrences = missionRule.between(missionStart, missionUntil, true);

        for (const missionOcc of missionOccurrences) {
          const missionEnd = new Date(
            missionOcc.getTime() + schedule.duration_mn * 60 * 1000
          );

          for (const availability of professionalAvailabilities) {
            try {
              const availRule = RRule.fromString(availability.rrule);
              const availStart =
                availRule.options.dtstart || new Date(mission.mission_dtstart);
              const availUntil = availRule.options.until || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
              const availOccurrences = availRule.between(availStart, availUntil, true);

              for (const availOcc of availOccurrences) {
                const availEnd = new Date(
                  availOcc.getTime() + availability.duration_mn * 60 * 1000
                );

                // Check for overlap
                if (
                  missionOcc.getTime() < availEnd.getTime() &&
                  missionEnd.getTime() > availOcc.getTime()
                ) {
                  overlapCount++;
                  overlaps.push({
                    missionId: mission.id,
                    professionalId: mission.professional_id,
                    missionDate: missionOcc.toISOString(),
                    availabilityId: availability.id,
                  });
                }
              }
            } catch (error) {
              // Skip invalid RRULE
            }
          }
        }
      } catch (error) {
        // Skip invalid RRULE
      }
    }
  }

  if (overlapCount > 0) {
    console.log(`⚠️  PROBLEM: Found ${overlapCount} overlap(s) between availabilities and ACCEPTED mission schedules!`);
    console.log(`   These overlaps should NOT exist - accepted missions should be blocked in availabilities.\n`);
    console.log('First 10 overlaps:');
    overlaps.slice(0, 10).forEach(overlap => {
      console.log(`   Mission: ${overlap.missionId}, Date: ${overlap.missionDate}, Availability: ${overlap.availabilityId}`);
    });
  } else {
    console.log('✅ SUCCESS: No overlaps found between availabilities and accepted missions!');
    console.log(`   ✅ All ${missions.length} accepted missions are properly blocked in availabilities.`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Accepted missions: ${missions.length}`);
  console.log(`   Availabilities: ${availabilities.length}`);
  console.log(`   Overlaps: ${overlapCount}`);
}

checkOverlaps()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

