import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';
import RRulePkg from 'rrule';
const { rrulestr } = RRulePkg;

import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';
import {
  type MissionSchedule,
  type ProfessionalAvailability,
  updateAvailabilitiesForMissions,
} from '../utils/updateAvailabilitiesForMissions.ts';

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
        if (mission.status === 'expired') {
          return apiResponse.badRequest(
            'INVALID_STATUS',
            'Cannot accept an expired mission. The mission start date has passed and the mission has expired.'
          );
        }
        if (mission.status === 'cancelled') {
          return apiResponse.badRequest(
            'INVALID_STATUS',
            'Cannot accept a cancelled mission.'
          );
        }
        if (mission.status === 'ended') {
          return apiResponse.badRequest(
            'INVALID_STATUS',
            'Cannot accept an ended mission. The mission end date has passed and the mission has ended.'
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

      // Get professional availabilities
      const { data: availabilities, error: availabilitiesError } =
        await supabaseAdminClient
          .from('availabilities')
          .select('id, rrule, duration_mn')
          .eq('user_id', mission.professional_id);

      if (availabilitiesError) {
        console.error('Error fetching availabilities:', availabilitiesError);
        return apiResponse.internalServerError(
          'Failed to fetch professional availabilities'
        );
      }

      // Convert mission schedules to the format expected by updateAvailabilitiesForMissions
      const missionSchedulesForUpdate: MissionSchedule[] = missionSchedules.map(
        schedule => ({
          duration_mn: schedule.duration_mn,
          rrule: schedule.rrule,
        })
      );

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
        // Find the original availability by matching rrule and duration
        // since update.originalAvailability doesn't have id
        const originalAvailability = (availabilities || []).find(
          a =>
            a.rrule === update.originalAvailability.rrule &&
            a.duration_mn === update.originalAvailability.duration_mn
        );
        if (!originalAvailability) continue;

        const { error: updateError } = await supabaseAdminClient
          .from('availabilities')
          .update({
            duration_mn:
              update.newDurationMn || originalAvailability.duration_mn,
            rrule: update.newRrule,
          })
          .eq('id', originalAvailability.id);

        if (updateError) {
          console.error(
            `Error updating availability ${originalAvailability.id}:`,
            updateError
          );
          // Continue with other updates even if one fails
        }
      }

      // Create new availabilities
      for (const create of availabilityUpdates.toCreate) {
        const { error: createError } = await supabaseAdminClient
          .from('availabilities')
          .insert({
            duration_mn: create.duration_mn,
            rrule: create.rrule,
            user_id: mission.professional_id,
          });

        if (createError) {
          console.error('Error creating availability:', createError);
          // Continue with other creates even if one fails
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
