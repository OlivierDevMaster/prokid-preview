import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';
import RRulePkg from 'rrule';
const { rrulestr } = RRulePkg;

import { CreateMissionRequestBodySchema } from '../../_shared/features/missions/index.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { constrainRRULEByDates } from '../../_shared/utils/rrule-generator.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const createMissionHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      const validationResult = await validateRequestBody(
        CreateMissionRequestBodySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const body = validationResult.data;
      const userId = get('user')?.id;
      const supabaseAdminClient = get('supabaseAdminClient');

      if (!userId || !supabaseAdminClient) {
        return apiResponse.unauthorized();
      }

      // Verify user is a structure
      const { data: profile, error: profileError } = await supabaseAdminClient
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (profileError || profile?.role !== 'structure') {
        return apiResponse.forbidden(
          'Only structures can create mission invitations'
        );
      }

      // Verify structure_id matches authenticated user
      if (body.structure_id !== userId) {
        return apiResponse.forbidden(
          'Structure ID must match authenticated user'
        );
      }

      // Verify professional is a member of the structure
      const { data: membership, error: membershipError } =
        await supabaseAdminClient
          .from('structure_members')
          .select('id')
          .eq('structure_id', body.structure_id)
          .eq('professional_id', body.professional_id)
          .is('deleted_at', null)
          .maybeSingle();

      if (membershipError || !membership) {
        return apiResponse.badRequest(
          'PROFESSIONAL_NOT_MEMBER',
          'Professional is not a member of this structure'
        );
      }

      // Parse mission dates
      const missionDtstart = new Date(body.mission_dtstart);
      const missionUntil = new Date(body.mission_until);

      if (isNaN(missionDtstart.getTime()) || isNaN(missionUntil.getTime())) {
        return apiResponse.badRequest(
          'INVALID_DATES',
          'Invalid mission date format'
        );
      }

      if (missionUntil <= missionDtstart) {
        return apiResponse.badRequest(
          'INVALID_DATE_RANGE',
          'Mission end date must be after start date'
        );
      }

      // Process and constrain RRULEs for each schedule
      const schedules: Array<{
        duration_mn: number;
        rrule: string;
      }> = [];

      for (const scheduleInput of body.schedules) {
        try {
          // Constrain RRULE by mission dates (also validates RRULE format)
          const constrainedRRULE = constrainRRULEByDates(
            scheduleInput.rrule,
            missionDtstart,
            missionUntil
          );

          schedules.push({
            duration_mn: scheduleInput.duration_mn,
            rrule: constrainedRRULE,
          });
        } catch (rruleError) {
          console.error(`Error processing RRULE for schedule:`, rruleError);
          return apiResponse.badRequest(
            'INVALID_RRULE',
            'Invalid RRULE format in schedule',
            {
              error: String(rruleError),
            }
          );
        }
      }

      // Check for overlapping accepted missions
      // Get accepted missions and their schedules
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
          .eq('professional_id', body.professional_id)
          .eq('status', 'accepted');

      if (missionsError) {
        console.error('Error fetching accepted missions:', missionsError);
        return apiResponse.internalServerError(
          'Failed to check mission overlaps'
        );
      }

      // Check for overlaps with accepted missions (collect information instead of rejecting)
      // Use a Set to track unique overlaps (mission_id + overlapping_date)
      const overlapSet = new Set<string>();
      const overlaps: Array<{
        mission_id: string;
        overlapping_date: string;
      }> = [];

      if (acceptedMissions && acceptedMissions.length > 0) {
        for (const newSchedule of schedules) {
          try {
            console.log(
              '[createMissionHandler] Parsing newSchedule.rrule:',
              newSchedule.rrule
            );

            // Parse RRULE using rrule library - it can handle UNTIL when it's in the RRULE line
            const newRule = rrulestr(newSchedule.rrule);
            console.log(
              '[createMissionHandler] Parsed newRule.options:',
              JSON.stringify(newRule.options, null, 2)
            );

            const newStart = newRule.options.dtstart || missionDtstart;
            const newUntil = newRule.options.until || missionUntil;
            console.log('[createMissionHandler] newStart:', newStart);
            console.log('[createMissionHandler] newUntil:', newUntil);

            const newOccurrences = newRule.between(newStart, newUntil, true);
            console.log(
              '[createMissionHandler] newOccurrences count:',
              newOccurrences.length
            );

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

                  // Check if any occurrences overlap
                  for (const newOcc of newOccurrences) {
                    const newOccEnd = new Date(
                      newOcc.getTime() + newSchedule.duration_mn * 60 * 1000
                    );

                    for (const acceptedOcc of acceptedOccurrences) {
                      const acceptedOccEnd = new Date(
                        acceptedOcc.getTime() +
                          acceptedSchedule.duration_mn * 60 * 1000
                      );

                      // Check overlap: newOcc < acceptedOccEnd && newOccEnd > acceptedOcc
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
                } catch (rruleError) {
                  console.error(
                    'Error parsing accepted mission schedule RRULE:',
                    rruleError
                  );
                  // Continue checking other schedules
                }
              }
            }
          } catch (rruleError) {
            console.error(
              'Error parsing new mission schedule RRULE:',
              rruleError
            );
            return apiResponse.badRequest(
              'INVALID_RRULE',
              'Invalid RRULE format in generated schedule',
              {
                error: String(rruleError),
              }
            );
          }
        }
      }

      // Create the mission
      const { data: mission, error: insertError } = await supabaseAdminClient
        .from('missions')
        .insert({
          description: body.description,
          mission_dtstart: missionDtstart.toISOString(),
          mission_until: missionUntil.toISOString(),
          professional_id: body.professional_id,
          status: body.status || 'pending',
          structure_id: body.structure_id,
          title: body.title,
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Error creating mission:', insertError);
        return apiResponse.internalServerError('Failed to create mission');
      }

      // Create mission schedules
      const { error: schedulesInsertError } = await supabaseAdminClient
        .from('mission_schedules')
        .insert(
          schedules.map(schedule => ({
            duration_mn: schedule.duration_mn,
            mission_id: mission.id,
            rrule: schedule.rrule,
          }))
        );

      if (schedulesInsertError) {
        console.error(
          'Error creating mission schedules:',
          schedulesInsertError
        );
        // Rollback mission creation
        await supabaseAdminClient
          .from('missions')
          .delete()
          .eq('id', mission.id);
        return apiResponse.internalServerError(
          'Failed to create mission schedules'
        );
      }

      // Return mission with overlap information in data if any overlaps were found
      return apiResponse.created({
        ...mission,
        overlaps: overlaps.length > 0 ? overlaps : undefined,
      });
    } catch (error) {
      console.error('Error in createMissionHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
