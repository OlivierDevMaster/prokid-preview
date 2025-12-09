import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';
import RRulePkg from 'rrule';
const { rrulestr } = RRulePkg;

import {
  CreateMissionRequestBodySchema,
  Mission,
} from '../../_shared/features/missions/index.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
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

      // Validate RRULE format
      let missionRule;
      try {
        missionRule = rrulestr(body.rrule);
      } catch (rruleError) {
        return apiResponse.badRequest('INVALID_RRULE', 'Invalid RRULE format', {
          error: String(rruleError),
        });
      }

      // Check for overlapping accepted missions
      // Get all accepted missions for this professional
      const { data: acceptedMissions, error: missionsError } =
        await supabaseAdminClient
          .from('missions')
          .select('rrule, duration_mn, dtstart, until')
          .eq('professional_id', body.professional_id)
          .eq('status', 'accepted');

      if (missionsError) {
        console.error('Error fetching missions:', missionsError);
        return apiResponse.internalServerError(
          'Failed to check mission overlaps'
        );
      }

      // Check for overlaps with accepted missions
      if (acceptedMissions && acceptedMissions.length > 0) {
        const missionStart = missionRule.options.dtstart;
        const missionUntil = missionRule.options.until;

        // Generate occurrences for the new mission within a reasonable range
        const checkStart = missionStart || new Date();
        const checkEnd =
          missionUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year ahead
        const newOccurrences = missionRule.between(checkStart, checkEnd, true);

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

            // Check if any occurrences overlap
            for (const newOcc of newOccurrences) {
              const newOccEnd = new Date(
                newOcc.getTime() + body.duration_mn * 60 * 1000
              );

              for (const acceptedOcc of acceptedOccurrences) {
                const acceptedOccEnd = new Date(
                  acceptedOcc.getTime() +
                    acceptedMission.duration_mn * 60 * 1000
                );

                // Check overlap: newOcc < acceptedOccEnd && newOccEnd > acceptedOcc
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
          } catch (rruleError) {
            console.error('Error parsing accepted mission RRULE:', rruleError);
            // Continue checking other missions
          }
        }
      }

      // Create the mission
      const { data: mission, error: insertError } = await supabaseAdminClient
        .from('missions')
        .insert({
          description: body.description,
          duration_mn: body.duration_mn,
          professional_id: body.professional_id,
          rrule: body.rrule,
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

      return apiResponse.created(mission as Mission);
    } catch (error) {
      console.error('Error in createMissionHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
