import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';
import RRulePkg from 'rrule';
const { rrulestr } = RRulePkg;

import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const acceptMissionHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      const missionId = req.param('id');
      const userId = get('user')?.id;
      const supabaseAdminClient = get('supabaseAdminClient');

      if (!userId || !supabaseAdminClient || !missionId) {
        return apiResponse.unauthorized();
      }

      // Get the mission
      const { data: mission, error: missionError } = await supabaseAdminClient
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single();

      if (missionError || !mission) {
        return apiResponse.notFound('Mission not found');
      }

      // Verify professional owns the mission
      if (mission.professional_id !== userId) {
        return apiResponse.forbidden(
          'Only the assigned professional can accept this mission'
        );
      }

      // Verify mission is pending
      if (mission.status !== 'pending') {
        if (mission.status === 'declined') {
          return apiResponse.badRequest(
            'INVALID_STATUS',
            'Cannot accept a declined mission. Once a mission is declined, the choice is final.'
          );
        }
        if (mission.status === 'accepted') {
          return apiResponse.badRequest(
            'INVALID_STATUS',
            'Mission is already accepted.'
          );
        }
        return apiResponse.badRequest(
          'INVALID_STATUS',
          'Only pending missions can be accepted'
        );
      }

      // Get mission schedules
      const { data: missionSchedules, error: schedulesError } =
        await supabaseAdminClient
          .from('mission_schedules')
          .select('rrule, duration_mn, dtstart, until')
          .eq('mission_id', missionId);

      if (
        schedulesError ||
        !missionSchedules ||
        missionSchedules.length === 0
      ) {
        return apiResponse.badRequest(
          'INVALID_MISSION',
          'Mission has no schedules'
        );
      }

      // Check for overlapping accepted missions (excluding this one)
      const { data: acceptedMissions, error: missionsError } =
        await supabaseAdminClient
          .from('missions')
          .select(
            `
            id,
            mission_schedules (
              rrule,
              duration_mn,
              dtstart,
              until
            )
          `
          )
          .eq('professional_id', mission.professional_id)
          .eq('status', 'accepted')
          .neq('id', missionId);

      if (missionsError) {
        console.error('Error fetching missions:', missionsError);
        return apiResponse.internalServerError(
          'Failed to check mission overlaps'
        );
      }

      // Check for overlaps (collect information instead of rejecting)
      // Use a Set to track unique overlaps (mission_id + overlapping_date)
      const overlapSet = new Set<string>();
      const overlaps: Array<{
        mission_id: string;
        overlapping_date: string;
      }> = [];

      if (acceptedMissions && acceptedMissions.length > 0) {
        for (const newSchedule of missionSchedules) {
          try {
            // Parse RRULE using rrule library
            const newRule = rrulestr(newSchedule.rrule);
            const newStart =
              newRule.options.dtstart ||
              (newSchedule.dtstart
                ? new Date(newSchedule.dtstart)
                : new Date(mission.mission_dtstart));
            const newUntil =
              newRule.options.until ||
              (newSchedule.until
                ? new Date(newSchedule.until)
                : new Date(mission.mission_until));
            const newOccurrences = newRule.between(newStart, newUntil, true);

            for (const acceptedMission of acceptedMissions) {
              if (!acceptedMission.mission_schedules) continue;

              for (const acceptedSchedule of acceptedMission.mission_schedules as Array<{
                dtstart: null | string;
                duration_mn: number;
                rrule: string;
                until: null | string;
              }>) {
                try {
                  // Parse RRULE using rrule library
                  const acceptedRule = rrulestr(acceptedSchedule.rrule);
                  const acceptedStart =
                    acceptedRule.options.dtstart ||
                    (acceptedSchedule.dtstart
                      ? new Date(acceptedSchedule.dtstart)
                      : new Date());
                  const acceptedUntil =
                    acceptedRule.options.until ||
                    (acceptedSchedule.until
                      ? new Date(acceptedSchedule.until)
                      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

                  const acceptedOccurrences = acceptedRule.between(
                    acceptedStart,
                    acceptedUntil,
                    true
                  );

                  for (const newOcc of newOccurrences) {
                    const newOccEnd = new Date(
                      newOcc.getTime() + newSchedule.duration_mn * 60 * 1000
                    );

                    for (const acceptedOcc of acceptedOccurrences) {
                      const acceptedOccEnd = new Date(
                        acceptedOcc.getTime() +
                          acceptedSchedule.duration_mn * 60 * 1000
                      );

                      if (
                        newOcc.getTime() < acceptedOccEnd.getTime() &&
                        newOccEnd.getTime() > acceptedOcc.getTime()
                      ) {
                        // Collect overlap information instead of rejecting
                        // Use a unique key to avoid duplicates
                        const overlapKey = `${acceptedMission.id}:${newOcc.toISOString()}`;
                        if (!overlapSet.has(overlapKey)) {
                          overlapSet.add(overlapKey);
                          overlaps.push({
                            mission_id: acceptedMission.id,
                            overlapping_date: newOcc.toISOString(),
                          });
                        }
                      }
                    }
                  }
                } catch {
                  // Skip schedules with invalid RRULE
                }
              }
            }
          } catch {
            // Skip schedules with invalid RRULE
          }
        }
      }

      // Update mission status
      const { data: updatedMission, error: updateError } =
        await supabaseAdminClient
          .from('missions')
          .update({ status: 'accepted' })
          .eq('id', missionId)
          .select('*')
          .single();

      if (updateError) {
        console.error('Error updating mission:', updateError);
        return apiResponse.internalServerError('Failed to accept mission');
      }

      // Return mission with overlap information in data if any overlaps were found
      return apiResponse.ok({
        mission: updatedMission,
        overlaps: overlaps.length > 0 ? overlaps : undefined,
      });
    } catch (error) {
      console.error('Error in acceptMissionHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
