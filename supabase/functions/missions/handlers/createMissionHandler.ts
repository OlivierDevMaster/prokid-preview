import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { CreateMissionRequestBodySchema } from '../../_shared/features/missions/index.ts';
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

      // Create the mission
      const { data: mission, error: insertError } = await supabaseAdminClient
        .from('missions')
        .insert({
          address: body.address,
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
