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

export const getMissionDurationHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      const userId = get('user')?.id;
      const supabaseAdminClient = get('supabaseAdminClient');

      if (!userId || !supabaseAdminClient) {
        return apiResponse.unauthorized();
      }

      // Get query parameters
      const url = new URL(req.url);
      const missionId = url.searchParams.get('mission_id');

      if (!missionId) {
        return apiResponse.badRequest(
          'MISSING_PARAMETERS',
          'mission_id is required'
        );
      }

      // Fetch the mission
      const { data: mission, error: missionError } = await supabaseAdminClient
        .from('missions')
        .select(
          'id, mission_dtstart, mission_until, status, professional_id, structure_id'
        )
        .eq('id', missionId)
        .maybeSingle();

      if (missionError) {
        return apiResponse.internalServerError('Failed to fetch mission', {
          error: missionError.message,
        });
      }

      if (!mission) {
        return apiResponse.notFound('Mission not found');
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
      const isProfessional = profile.user_id === mission.professional_id;
      const isStructure =
        profile.user_id === mission.structure_id &&
        profile.role === 'structure';

      if (!isProfessional && !isStructure) {
        return apiResponse.forbidden(
          'User does not have access to this mission duration'
        );
      }

      // Exclude declined, cancelled, and expired missions
      if (
        mission.status === 'declined' ||
        mission.status === 'cancelled' ||
        mission.status === 'expired'
      ) {
        return apiResponse.ok({
          future_duration_mn: 0,
          past_duration_mn: 0,
          percentage: 0,
          total_duration_mn: 0,
        });
      }

      const missionDtstart = new Date(mission.mission_dtstart);
      const missionUntil = new Date(mission.mission_until);
      const now = new Date();

      // Fetch all schedules for this mission
      const { data: schedules, error: schedulesError } =
        await supabaseAdminClient
          .from('mission_schedules')
          .select('rrule, duration_mn')
          .eq('mission_id', mission.id);

      if (schedulesError) {
        return apiResponse.internalServerError('Failed to fetch schedules', {
          error: schedulesError.message,
        });
      }

      if (!schedules || schedules.length === 0) {
        return apiResponse.ok({
          future_duration_mn: 0,
          past_duration_mn: 0,
          percentage: 0,
          total_duration_mn: 0,
        });
      }

      let totalDurationMn = 0;
      let pastDurationMn = 0;
      let futureDurationMn = 0;

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
      console.error('Error in getMissionDurationHandler:', error);
      return apiResponse.internalServerError('An unexpected error occurred', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);
