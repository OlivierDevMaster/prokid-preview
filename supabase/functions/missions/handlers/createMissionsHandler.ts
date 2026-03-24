import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { CreateMissionsRequestBodySchema } from '../../_shared/features/missions/index.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';
import { sendMissionReceivedEmail } from '../utils/sendMissionReceivedEmail.ts';

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const createMissionsHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      const validationResult = await validateRequestBody(
        CreateMissionsRequestBodySchema,
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

      // Verify all professionals exist
      const { data: existingProfessionals, error: professionalsError } =
        await supabaseAdminClient
          .from('professionals')
          .select('user_id')
          .in('user_id', body.professional_ids);

      if (professionalsError) {
        console.error('Error fetching professionals:', professionalsError);
        return apiResponse.internalServerError(
          'Failed to verify professionals'
        );
      }

      const foundIds = new Set(
        (existingProfessionals ?? []).map(p => p.user_id)
      );
      const missingIds = body.professional_ids.filter(id => !foundIds.has(id));

      if (missingIds.length > 0) {
        return apiResponse.badRequest(
          'PROFESSIONALS_NOT_FOUND',
          'One or more professionals do not exist',
          { professional_ids: missingIds }
        );
      }

      const rows = body.professional_ids.map(professional_id => ({
        address: body.address,
        description: body.description,
        mission_dtstart: missionDtstart.toISOString(),
        mission_until: missionUntil.toISOString(),
        modality: body.modality,
        professional_id,
        status: body.status || 'pending',
        structure_id: body.structure_id,
        title: body.title,
      }));

      const { data: missions, error: insertError } = await supabaseAdminClient
        .from('missions')
        .insert(rows)
        .select('*');

      if (insertError) {
        console.error('Error creating missions:', insertError);
        return apiResponse.internalServerError('Failed to create missions');
      }

      const createdMissions = missions ?? [];

      // Send mission_received email to each professional via Resend
      const { data: structureRow } = await supabaseAdminClient
        .from('structures')
        .select('name')
        .eq('user_id', body.structure_id)
        .single();

      const structureName = structureRow?.name ?? '';

      await Promise.allSettled(
        createdMissions.map(mission =>
          sendMissionReceivedEmail(
            supabaseAdminClient,
            {
              id: mission.id,
              professional_id: mission.professional_id,
              structure_id: mission.structure_id,
              title: mission.title,
            },
            structureName
          )
        )
      );

      return apiResponse.created({
        missions: createdMissions,
      });
    } catch (error) {
      console.error('Error in createMissionsHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
