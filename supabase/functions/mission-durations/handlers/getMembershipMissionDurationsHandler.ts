import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';
import {
  calculateScheduleDuration,
  generateMissionOccurrences,
  type MissionSchedule,
} from '../utils/missionDuration.utils.ts';

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const getMembershipMissionDurationsHandler = factory.createHandlers(
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

      // Fetch all missions for the professional in the structure
      // Exclude declined, cancelled, and expired missions
      const { data: missions, error: missionsError } = await supabaseAdminClient
        .from('missions')
        .select('id, mission_dtstart, mission_until, status')
        .eq('professional_id', professionalId)
        .eq('structure_id', structureId)
        .not('status', 'in', '(declined,cancelled,expired)');

      if (missionsError) {
        return apiResponse.internalServerError('Failed to fetch missions', {
          error: missionsError.message,
        });
      }

      if (!missions || missions.length === 0) {
        return apiResponse.ok({
          future_duration_mn: 0,
          past_duration_mn: 0,
          percentage: 0,
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

            // Calculate durations using shared utility
            const durationCalculation = calculateScheduleDuration(
              scheduleData,
              occurrences,
              now
            );

            // Accumulate totals
            totalDurationMn += durationCalculation.total_duration_mn;
            pastDurationMn += durationCalculation.past_duration_mn;
            futureDurationMn += durationCalculation.future_duration_mn;
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

      // Calculate percentage (past / total * 100)
      // Handle division by zero: if total is 0, percentage is 0
      const percentage =
        totalDurationMn > 0
          ? Math.round((pastDurationMn / totalDurationMn) * 100 * 100) / 100
          : 0;

      return apiResponse.ok({
        future_duration_mn: futureDurationMn,
        past_duration_mn: pastDurationMn,
        percentage,
        total_duration_mn: totalDurationMn,
      });
    } catch (error) {
      console.error('Error in getMembershipMissionDurationsHandler:', error);
      return apiResponse.internalServerError('An unexpected error occurred', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);
