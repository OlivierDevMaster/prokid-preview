import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { CreateMissionRequestBodySchema } from '../../_shared/features/missions/index.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import {
  type ProfessionalAvailability,
  validateMissionAvailability,
} from '../../_shared/utils/validateMissionAvailability.ts';
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

      // Fetch professional availabilities for validation
      const { data: availabilitiesData, error: availabilitiesError } =
        await supabaseAdminClient
          .from('availabilities')
          .select('duration_mn, rrule')
          .eq('user_id', body.professional_id);

      if (availabilitiesError) {
        console.error('Error fetching availabilities:', availabilitiesError);
        return apiResponse.internalServerError(
          'Failed to fetch professional availabilities'
        );
      }

      // Convert availabilities to the format expected by validateMissionAvailability
      const availabilities: ProfessionalAvailability[] = (
        availabilitiesData || []
      ).map(avail => ({
        duration_mn: avail.duration_mn,
        rrule: avail.rrule,
      }));

      // Convert mission schedules to the format expected by validateMissionAvailability
      const missionSchedules = body.schedules.map(schedule => ({
        duration_mn: schedule.duration_mn,
        rrule: schedule.rrule,
      }));

      // Validate that all mission schedules fall within professional availabilities
      // This function will constrain RRULEs internally and check coverage
      // It returns the constrained schedules that should be stored in the database
      let schedules: Array<{
        duration_mn: number;
        rrule: string;
      }> = [];

      try {
        const availabilityValidationResult = validateMissionAvailability(
          missionSchedules,
          missionDtstart,
          missionUntil,
          availabilities
        );

        if (!availabilityValidationResult.isValid) {
          return apiResponse.badRequest(
            'MISSION_NOT_WITHIN_AVAILABILITY',
            'Mission schedules do not fall within professional availability',
            {
              violations: availabilityValidationResult.violations,
            }
          );
        }

        // Use the constrained schedules returned from validation
        // These are the same schedules that were validated, ensuring consistency
        if (!availabilityValidationResult.constrainedSchedules) {
          return apiResponse.internalServerError(
            'Validation succeeded but no constrained schedules returned'
          );
        }

        schedules = availabilityValidationResult.constrainedSchedules;
      } catch (validationError) {
        console.error(
          'Error validating mission availability:',
          validationError
        );
        return apiResponse.badRequest(
          'INVALID_RRULE',
          'Invalid RRULE format in schedule',
          {
            error: String(validationError),
          }
        );
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
          address: body.address,
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

      // Return the created mission
      return apiResponse.created({
        mission,
      });
    } catch (error) {
      console.error('Error in createMissionHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
