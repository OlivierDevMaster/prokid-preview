import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';
import { createMissionSystemMessage } from '../utils/createMissionSystemMessage.ts';

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

      // Update mission status
      const { data: updatedMission, error: updateError } =
        await supabaseAdminClient
          .from('missions')
          .update({ status: 'accepted' })
          .eq('id', missionId)
          .select('*')
          .single();

      if (updateError || !updatedMission) {
        console.error('Error updating mission:', updateError);
        return apiResponse.internalServerError('Failed to accept mission');
      }

      await createMissionSystemMessage({
        actor: 'professional',
        mission: updatedMission,
        status: 'accepted',
        supabaseAdminClient,
      });

      // Return mission with overlap information in data if any overlaps were found
      return apiResponse.ok({
        mission: updatedMission,
      });
    } catch (error) {
      console.error('Error in acceptMissionHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
