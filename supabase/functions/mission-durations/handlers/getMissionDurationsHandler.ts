import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';
import RRulePkg from 'rrule';

import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';
const { RRuleSet, rrulestr } = RRulePkg;

type MissionSchedule = {
  duration_mn: number;
  rrule: string;
};

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

/**
 * Generates all occurrences for a mission schedule.
 * Parses the RRULE directly (source of truth) and generates occurrences.
 * Only includes occurrences that fall within the mission date range.
 * Handles both RRule and RRuleSet (when EXDATE is present).
 * Supports RRULEs with UNTIL, COUNT, or neither.
 */
function generateMissionOccurrences(
  schedule: MissionSchedule,
  missionDtstart: Date,
  missionUntil: Date
): Date[] {
  // Parse the RRULE directly - it's the source of truth
  const rule = rrulestr(schedule.rrule);

  // Determine the date range for generating occurrences
  // Use the RRULE's own DTSTART if present, otherwise use mission start
  // For the end, we need to handle UNTIL, COUNT, or neither
  let scheduleStart: Date;
  let scheduleEnd: Date;

  if (
    rule instanceof RRuleSet ||
    typeof (rule as RRulePkg.RRuleSet).rrules === 'function'
  ) {
    // It's an RRuleSet - get dtstart/until from the first RRule
    const rruleSet = rule as RRulePkg.RRuleSet;
    const rules = rruleSet.rrules();

    if (rules.length > 0) {
      const firstRule = rules[0];
      scheduleStart = firstRule.options.dtstart || missionDtstart;
      // If UNTIL exists, use it; if COUNT exists, we need to generate all and filter
      // Otherwise, use missionUntil as a safe upper bound
      scheduleEnd = firstRule.options.until || missionUntil;
    } else {
      return [];
    }
  } else {
    // It's a regular RRule
    const rrule = rule as RRulePkg.RRule;
    scheduleStart = rrule.options.dtstart || missionDtstart;
    // If UNTIL exists, use it; if COUNT exists, we need to generate all and filter
    // Otherwise, use missionUntil as a safe upper bound
    scheduleEnd = rrule.options.until || missionUntil;
  }

  // Generate all occurrences from the RRULE
  // If COUNT is present, this will generate exactly COUNT occurrences
  // If UNTIL is present, this will generate up to UNTIL
  // We'll filter by mission range afterwards to ensure we only count valid occurrences
  const allOccurrences = rule.between(scheduleStart, scheduleEnd, true);

  // Filter occurrences to only include those within the mission date range
  return allOccurrences.filter(
    occ => occ >= missionDtstart && occ <= missionUntil
  );
}

export const getMissionDurationsHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      const userId = get('user')?.id;
      const supabaseAdminClient = get('supabaseAdminClient');

      if (!userId || !supabaseAdminClient) {
        return apiResponse.unauthorized();
      }

      // Get query parameters
      const url = new URL(req.url);
      const professionalId = url.searchParams.get('professional_id');
      const structureId = url.searchParams.get('structure_id');

      if (!professionalId || !structureId) {
        return apiResponse.badRequest(
          'MISSING_PARAMETERS',
          'professional_id and structure_id are required'
        );
      }

      // Verify user has access (either the professional or the structure)
      const { data: profile, error: profileError } = await supabaseAdminClient
        .from('profiles')
        .select('role, user_id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        return apiResponse.unauthorized();
      }

      // Check if user is the professional or the structure
      const isProfessional = profile.user_id === professionalId;
      const isStructure =
        profile.user_id === structureId && profile.role === 'structure';

      if (!isProfessional && !isStructure) {
        return apiResponse.forbidden(
          'User does not have access to these mission durations'
        );
      }

      // Verify professional is a member of the structure
      const { data: membership, error: membershipError } =
        await supabaseAdminClient
          .from('structure_members')
          .select('id')
          .eq('structure_id', structureId)
          .eq('professional_id', professionalId)
          .is('deleted_at', null)
          .maybeSingle();

      if (membershipError || !membership) {
        return apiResponse.badRequest(
          'PROFESSIONAL_NOT_MEMBER',
          'Professional is not a member of this structure'
        );
      }

      // Fetch all missions for the professional in the structure
      // Exclude declined and cancelled missions
      const { data: missions, error: missionsError } = await supabaseAdminClient
        .from('missions')
        .select('id, mission_dtstart, mission_until, status')
        .eq('professional_id', professionalId)
        .eq('structure_id', structureId)
        .not('status', 'in', '(declined,cancelled)');

      if (missionsError) {
        return apiResponse.internalServerError('Failed to fetch missions', {
          error: missionsError.message,
        });
      }

      if (!missions || missions.length === 0) {
        return apiResponse.ok({
          future_duration_mn: 0,
          past_duration_mn: 0,
          total_duration_mn: 0,
        });
      }

      const now = new Date();
      let totalDurationMn = 0;
      let pastDurationMn = 0;
      let futureDurationMn = 0;

      // Process each mission
      for (const mission of missions) {
        const missionDtstart = new Date(mission.mission_dtstart);
        const missionUntil = new Date(mission.mission_until);

        // Fetch all schedules for this mission
        const { data: schedules, error: schedulesError } =
          await supabaseAdminClient
            .from('mission_schedules')
            .select('rrule, duration_mn')
            .eq('mission_id', mission.id);

        if (schedulesError) {
          // Log error but continue processing other missions
          console.error(
            `Error fetching schedules for mission ${mission.id}:`,
            schedulesError
          );
          continue;
        }

        if (!schedules || schedules.length === 0) {
          // Mission has no schedules, skip it
          continue;
        }

        // Process each schedule
        for (const schedule of schedules) {
          try {
            // Generate all occurrences for this schedule
            // RRULE is the source of truth - parse it directly
            const scheduleData: MissionSchedule = {
              duration_mn: schedule.duration_mn,
              rrule: schedule.rrule,
            };
            const occurrences = generateMissionOccurrences(
              scheduleData,
              missionDtstart,
              missionUntil
            );

            // Split occurrences by current date
            const pastOccurrences = occurrences.filter(occ => occ < now);
            const futureOccurrences = occurrences.filter(occ => occ >= now);

            // Calculate durations
            const scheduleTotalDuration =
              occurrences.length * schedule.duration_mn;
            const schedulePastDuration =
              pastOccurrences.length * schedule.duration_mn;
            const scheduleFutureDuration =
              futureOccurrences.length * schedule.duration_mn;

            // Accumulate totals
            totalDurationMn += scheduleTotalDuration;
            pastDurationMn += schedulePastDuration;
            futureDurationMn += scheduleFutureDuration;
          } catch (error) {
            // Log error but continue processing other schedules
            console.error(
              `Error processing schedule for mission ${mission.id}:`,
              error
            );
            continue;
          }
        }
      }

      return apiResponse.ok({
        future_duration_mn: futureDurationMn,
        past_duration_mn: pastDurationMn,
        total_duration_mn: totalDurationMn,
      });
    } catch (error) {
      console.error('Error in getMissionDurationsHandler:', error);
      return apiResponse.internalServerError('An unexpected error occurred', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);
