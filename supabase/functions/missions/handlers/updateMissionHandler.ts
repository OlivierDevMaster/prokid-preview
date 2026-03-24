import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { UpdateMissionRequestBodySchema } from '../../_shared/features/missions/index.ts';
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

export const updateMissionHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      // Extract mission ID from URL params
      const url = new URL(req.url);
      const missionId = url.pathname.split('/').filter(Boolean).pop();

      if (!missionId) {
        return apiResponse.badRequest(
          'MISSION_ID_REQUIRED',
          'Mission ID is required in the URL path'
        );
      }

      const validationResult = await validateRequestBody(
        UpdateMissionRequestBodySchema,
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
          'ONLY_STRUCTURES_CAN_EDIT',
          'Only structures can edit missions'
        );
      }

      // Fetch the existing mission
      const { data: existingMission, error: missionFetchError } =
        await supabaseAdminClient
          .from('missions')
          .select('*')
          .eq('id', missionId)
          .single();

      if (missionFetchError || !existingMission) {
        return apiResponse.notFound(
          'MISSION_NOT_FOUND',
          'Mission not found or you do not have access to it'
        );
      }

      // Verify mission belongs to the structure
      if (existingMission.structure_id !== userId) {
        return apiResponse.forbidden(
          'MISSION_OWNERSHIP',
          'You can only edit missions that belong to your structure'
        );
      }

      // Verify mission status allows editing (only draft or pending)
      if (
        existingMission.status !== 'draft' &&
        existingMission.status !== 'pending'
      ) {
        return apiResponse.badRequest(
          'MISSION_NOT_EDITABLE',
          'Only missions with status "draft" or "pending" can be edited',
          {
            currentStatus: existingMission.status,
          }
        );
      }

      // Prepare update data for mission
      const missionUpdateData: Partial<
        Database['public']['Tables']['missions']['Update']
      > = {};

      if (body.title !== undefined) {
        missionUpdateData.title = body.title;
      }

      if (body.description !== undefined) {
        missionUpdateData.description = body.description;
      }

      if (body.status !== undefined) {
        missionUpdateData.status = body.status;
      }

      if (body.address !== undefined) {
        missionUpdateData.address = body.address;
      }

      if (body.modality !== undefined) {
        missionUpdateData.modality = body.modality;
      }

      // Parse and validate mission dates if provided
      let missionDtstart = existingMission.mission_dtstart
        ? new Date(existingMission.mission_dtstart)
        : null;
      let missionUntil = existingMission.mission_until
        ? new Date(existingMission.mission_until)
        : null;

      if (body.mission_dtstart !== undefined) {
        missionDtstart = new Date(body.mission_dtstart);
        if (isNaN(missionDtstart.getTime())) {
          return apiResponse.badRequest(
            'INVALID_START_DATE',
            'Invalid mission start date format'
          );
        }
        missionUpdateData.mission_dtstart = missionDtstart.toISOString();
      }

      if (body.mission_until !== undefined) {
        missionUntil = new Date(body.mission_until);
        if (isNaN(missionUntil.getTime())) {
          return apiResponse.badRequest(
            'INVALID_END_DATE',
            'Invalid mission end date format'
          );
        }
        missionUpdateData.mission_until = missionUntil.toISOString();
      }

      // Validate date range
      if (missionDtstart && missionUntil && missionUntil <= missionDtstart) {
        return apiResponse.badRequest(
          'INVALID_DATE_RANGE',
          'Mission end date must be after start date'
        );
      }

      // Handle schedule updates if provided
      if (body.schedules) {
        // Verify that schedule IDs to update/delete belong to this mission
        // Filter out invalid ones and continue with valid ones
        const scheduleIdsToCheck = [
          ...(body.schedules.update?.map(s => s.id) || []),
          ...(body.schedules.delete || []),
        ];

        if (scheduleIdsToCheck.length > 0) {
          const { data: existingSchedules, error: schedulesFetchError } =
            await supabaseAdminClient
              .from('mission_schedules')
              .select('id')
              .eq('mission_id', missionId)
              .in('id', scheduleIdsToCheck);

          if (schedulesFetchError) {
            console.error(
              'Error fetching existing schedules:',
              schedulesFetchError
            );
            return apiResponse.internalServerError(
              'Failed to verify schedule ownership'
            );
          }

          const existingScheduleIds = new Set(
            existingSchedules?.map(s => s.id) || []
          );

          // Filter out invalid schedule IDs from delete array
          if (body.schedules.delete && body.schedules.delete.length > 0) {
            const invalidDeleteIds = body.schedules.delete.filter(
              id => !existingScheduleIds.has(id)
            );
            if (invalidDeleteIds.length > 0) {
              console.warn(
                `Skipping ${invalidDeleteIds.length} invalid schedule IDs from delete:`,
                invalidDeleteIds
              );
            }
            body.schedules.delete = body.schedules.delete.filter(id =>
              existingScheduleIds.has(id)
            );
          }

          // Filter out invalid schedule IDs from update array
          if (body.schedules.update && body.schedules.update.length > 0) {
            const invalidUpdateIds = body.schedules.update
              .filter(s => !existingScheduleIds.has(s.id))
              .map(s => s.id);
            if (invalidUpdateIds.length > 0) {
              console.warn(
                `Skipping ${invalidUpdateIds.length} invalid schedule IDs from update:`,
                invalidUpdateIds
              );
            }
            body.schedules.update = body.schedules.update.filter(s =>
              existingScheduleIds.has(s.id)
            );
          }
        }

        // Validate that at least one schedule will remain
        const currentScheduleCount = await supabaseAdminClient
          .from('mission_schedules')
          .select('id', { count: 'exact', head: true })
          .eq('mission_id', missionId);

        const schedulesToDelete = body.schedules.delete?.length || 0;
        const schedulesToCreate = body.schedules.create?.length || 0;

        const finalScheduleCount =
          (currentScheduleCount.count || 0) -
          schedulesToDelete +
          schedulesToCreate;

        if (finalScheduleCount < 1) {
          return apiResponse.badRequest(
            'MINIMUM_SCHEDULES_REQUIRED',
            'At least one schedule must remain after update'
          );
        }

        // Validate new and updated schedules against professional availabilities
        const schedulesToValidate = [
          ...(body.schedules.create || []),
          ...(body.schedules.update || []),
        ];

        if (schedulesToValidate.length > 0) {
          // Fetch professional availabilities for validation
          const { data: availabilitiesData, error: availabilitiesError } =
            await supabaseAdminClient
              .from('availabilities')
              .select('duration_mn, rrule')
              .eq('user_id', existingMission.professional_id);

          if (availabilitiesError) {
            console.error(
              'Error fetching availabilities:',
              availabilitiesError
            );
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

          // Convert schedules to the format expected by validateMissionAvailability
          const missionSchedules = schedulesToValidate.map(schedule => ({
            duration_mn: schedule.duration_mn,
            rrule: schedule.rrule,
          }));

          // Validate that all mission schedules fall within professional availabilities
          try {
            const availabilityValidationResult = validateMissionAvailability(
              missionSchedules,
              missionDtstart || new Date(existingMission.mission_dtstart),
              missionUntil || new Date(existingMission.mission_until),
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
            if (!availabilityValidationResult.constrainedSchedules) {
              return apiResponse.internalServerError(
                'Validation succeeded but no constrained schedules returned'
              );
            }

            // Update the schedules with constrained RRULEs
            const constrainedSchedules =
              availabilityValidationResult.constrainedSchedules;

            // Update create schedules with constrained RRULEs
            if (body.schedules.create) {
              body.schedules.create = constrainedSchedules.slice(
                0,
                body.schedules.create.length
              );
            }

            // Update update schedules with constrained RRULEs
            if (body.schedules.update) {
              const updateStartIndex = body.schedules.create?.length || 0;
              body.schedules.update = body.schedules.update.map(
                (schedule, index) => ({
                  ...schedule,
                  duration_mn:
                    constrainedSchedules[updateStartIndex + index]
                      ?.duration_mn || schedule.duration_mn,
                  rrule:
                    constrainedSchedules[updateStartIndex + index]?.rrule ||
                    schedule.rrule,
                })
              );
            }
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
        }
      }

      // Perform atomic update using a transaction-like approach
      // Update mission first
      if (Object.keys(missionUpdateData).length > 0) {
        const { error: updateError } = await supabaseAdminClient
          .from('missions')
          .update(missionUpdateData)
          .eq('id', missionId);

        if (updateError) {
          console.error('Error updating mission:', updateError);
          return apiResponse.internalServerError('Failed to update mission');
        }
      }

      // Handle schedule updates if provided
      if (body.schedules) {
        // Delete schedules first
        if (body.schedules.delete && body.schedules.delete.length > 0) {
          const { error: deleteError } = await supabaseAdminClient
            .from('mission_schedules')
            .delete()
            .in('id', body.schedules.delete)
            .eq('mission_id', missionId); // Extra safety check

          if (deleteError) {
            console.error('Error deleting schedules:', deleteError);
            return apiResponse.internalServerError(
              'Failed to delete mission schedules'
            );
          }
        }

        // Update existing schedules
        if (body.schedules.update && body.schedules.update.length > 0) {
          for (const schedule of body.schedules.update) {
            const { error: updateError } = await supabaseAdminClient
              .from('mission_schedules')
              .update({
                duration_mn: schedule.duration_mn,
                rrule: schedule.rrule,
              })
              .eq('id', schedule.id)
              .eq('mission_id', missionId); // Extra safety check

            if (updateError) {
              console.error('Error updating schedule:', updateError);
              return apiResponse.internalServerError(
                'Failed to update mission schedule'
              );
            }
          }
        }

        // Create new schedules
        if (body.schedules.create && body.schedules.create.length > 0) {
          const { error: createError } = await supabaseAdminClient
            .from('mission_schedules')
            .insert(
              body.schedules.create.map(schedule => ({
                duration_mn: schedule.duration_mn,
                mission_id: missionId,
                rrule: schedule.rrule,
              }))
            );

          if (createError) {
            console.error('Error creating schedules:', createError);
            return apiResponse.internalServerError(
              'Failed to create mission schedules'
            );
          }
        }
      }

      // Fetch the updated mission with schedules
      const { data: finalMission, error: finalFetchError } =
        await supabaseAdminClient
          .from('missions')
          .select('*, mission_schedules(*)')
          .eq('id', missionId)
          .single();

      if (finalFetchError) {
        console.error('Error fetching updated mission:', finalFetchError);
        return apiResponse.internalServerError(
          'Failed to fetch updated mission'
        );
      }

      return apiResponse.ok({
        mission: finalMission,
      });
    } catch (error) {
      console.error('Error in updateMissionHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
