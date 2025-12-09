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

      // Parse mission RRULE
      let missionRule;
      try {
        missionRule = rrulestr(mission.rrule);
      } catch {
        return apiResponse.badRequest(
          'INVALID_RRULE',
          'Mission has invalid RRULE format'
        );
      }

      // Check for overlapping accepted missions (excluding this one)
      const { data: acceptedMissions, error: missionsError } =
        await supabaseAdminClient
          .from('missions')
          .select('rrule, duration_mn, dtstart, until')
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
        const missionStart = missionRule.options.dtstart || new Date();
        const missionUntil =
          missionRule.options.until ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const newOccurrences = missionRule.between(
          missionStart,
          missionUntil,
          true
        );

        for (const acceptedMission of acceptedMissions) {
          try {
            const acceptedRule = rrulestr(acceptedMission.rrule);
            const acceptedStart =
              acceptedRule.options.dtstart ||
              (acceptedMission.dtstart
                ? new Date(acceptedMission.dtstart)
                : new Date());
            const acceptedUntil =
              acceptedRule.options.until ||
              (acceptedMission.until
                ? new Date(acceptedMission.until)
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

            const acceptedOccurrences = acceptedRule.between(
              acceptedStart,
              acceptedUntil,
              true
            );

            for (const newOcc of newOccurrences) {
              const newOccEnd = new Date(
                newOcc.getTime() + mission.duration_mn * 60 * 1000
              );

              for (const acceptedOcc of acceptedOccurrences) {
                const acceptedOccEnd = new Date(
                  acceptedOcc.getTime() +
                    acceptedMission.duration_mn * 60 * 1000
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
            // Skip missions with invalid RRULE
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

      // Update availability: find matching availability and add UNTIL
      const missionDtstart = missionRule.options.dtstart;
      const missionUntil = missionRule.options.until;

      if (missionDtstart) {
        // Find availabilities for this professional
        const { data: availabilities, error: availError } =
          await supabaseAdminClient
            .from('availabilities')
            .select('id, rrule, duration_mn')
            .eq('user_id', mission.professional_id);

        if (!availError && availabilities) {
          let matchedAvailability = null;

          // Try to find a matching availability
          for (const availability of availabilities) {
            try {
              const availRule = rrulestr(availability.rrule);
              const availDtstart = availRule.options.dtstart;

              // Check if same day pattern and similar time
              if (
                availDtstart &&
                missionDtstart &&
                availDtstart.getDay() === missionDtstart.getDay() &&
                Math.abs(availDtstart.getHours() - missionDtstart.getHours()) <=
                  1 &&
                availability.duration_mn === mission.duration_mn
              ) {
                matchedAvailability = availability;
                break;
              }
            } catch {
              // Skip invalid RRULE
              continue;
            }
          }

          if (matchedAvailability) {
            // Update existing availability with UNTIL
            try {
              const availRule = rrulestr(matchedAvailability.rrule);
              const untilDate = missionUntil || missionDtstart;

              // Create new RRULE with UNTIL
              const newRule = new RRule({
                ...availRule.options,
                until: untilDate,
              });

              const updatedRrule = `DTSTART:${
                availRule.options.dtstart
                  .toISOString()
                  .replace(/[-:]/g, '')
                  .split('.')[0]
              }Z\nRRULE:${newRule.toString()}`;

              await supabaseAdminClient
                .from('availabilities')
                .update({ rrule: updatedRrule })
                .eq('id', matchedAvailability.id);
            } catch (updateError) {
              console.error('Error updating availability:', updateError);
              // Continue even if availability update fails
            }
          } else {
            // Create new availability with UNTIL
            try {
              const untilDate = missionUntil || missionDtstart;
              const newRule = new RRule({
                ...missionRule.options,
                until: untilDate,
              });

              const newRrule = `DTSTART:${
                missionDtstart.toISOString().replace(/[-:]/g, '').split('.')[0]
              }Z\nRRULE:${newRule.toString()}`;

              await supabaseAdminClient.from('availabilities').insert({
                duration_mn: mission.duration_mn,
                rrule: newRrule,
                user_id: mission.professional_id,
              });
            } catch (insertError) {
              console.error('Error creating availability:', insertError);
              // Continue even if availability creation fails
            }
          }
        }
      }

      return apiResponse.ok(updatedMission as Mission);
    } catch (error) {
      console.error('Error in acceptMissionHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
