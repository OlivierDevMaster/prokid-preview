import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';
import RRulePkg from 'rrule';
const { RRule, rrulestr } = RRulePkg;

import { Mission } from '../../_shared/features/missions/index.ts';
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
        return apiResponse.badRequest(
          'INVALID_STATUS',
          'Only pending missions can be accepted'
        );
      }

      // Get mission schedules
      const { data: missionSchedules, error: schedulesError } =
        await supabaseAdminClient
          .from('mission_schedules')
          .select('rrule, duration_mn, dtstart, until, availability_id')
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

      // Check for overlaps
      if (acceptedMissions && acceptedMissions.length > 0) {
        for (const newSchedule of missionSchedules) {
          try {
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
                        return apiResponse.conflict(
                          'MISSION_OVERLAP',
                          'Mission overlaps with an accepted mission',
                          {
                            overlapping_date: newOcc.toISOString(),
                          }
                        );
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

      // Update availability: match each schedule to its availability and add UNTIL
      for (const schedule of missionSchedules) {
        try {
          if (!schedule.availability_id) {
            console.error('Schedule missing availability_id');
            continue;
          }

          const scheduleRule = rrulestr(schedule.rrule);
          const missionUntil =
            scheduleRule.options.until ||
            (schedule.until
              ? new Date(schedule.until)
              : new Date(mission.mission_until));

          // Get the availability
          const { data: availability, error: availError } =
            await supabaseAdminClient
              .from('availabilities')
              .select('id, rrule')
              .eq('id', schedule.availability_id)
              .single();

          if (availError || !availability) {
            console.error('Error fetching availability:', availError);
            continue;
          }

          // Update availability with UNTIL
          try {
            const availRule = rrulestr(availability.rrule);
            const untilDate = missionUntil;

            // Create new RRULE with UNTIL
            const newRule = new RRule({
              ...availRule.options,
              until: untilDate,
            });

            const updatedRrule = `DTSTART:${
              availRule.options.dtstart
                ?.toISOString()
                .replace(/[-:]/g, '')
                .split('.')[0] || ''
            }Z\nRRULE:${newRule.toString()}`;

            await supabaseAdminClient
              .from('availabilities')
              .update({ rrule: updatedRrule })
              .eq('id', availability.id);
          } catch (updateError) {
            console.error('Error updating availability:', updateError);
            // Continue even if availability update fails
          }
        } catch (error) {
          console.error('Error processing schedule:', error);
          // Continue with next schedule
        }
      }

      return apiResponse.ok(updatedMission as Mission);
    } catch (error) {
      console.error('Error in acceptMissionHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
