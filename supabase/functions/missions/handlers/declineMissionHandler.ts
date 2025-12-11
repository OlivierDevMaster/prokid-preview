import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { Mission } from '../../_shared/features/missions/index.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const declineMissionHandler = factory.createHandlers(
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
          'Only the assigned professional can decline this mission'
        );
      }

      // Verify mission is pending
      if (mission.status !== 'pending') {
        if (mission.status === 'accepted') {
          return apiResponse.badRequest(
            'INVALID_STATUS',
            'Cannot decline an accepted mission. Once a mission is accepted, the choice is final.'
          );
        }
        if (mission.status === 'declined') {
          return apiResponse.badRequest(
            'INVALID_STATUS',
            'Mission is already declined.'
          );
        }
        return apiResponse.badRequest(
          'INVALID_STATUS',
          'Only pending missions can be declined'
        );
      }

      // Update mission status
      const { data: updatedMission, error: updateError } =
        await supabaseAdminClient
          .from('missions')
          .update({ status: 'declined' })
          .eq('id', missionId)
          .select('*')
          .single();

      if (updateError) {
        console.error('Error updating mission:', updateError);
        return apiResponse.internalServerError('Failed to decline mission');
      }

      return apiResponse.ok(updatedMission as Mission);
    } catch (error) {
      console.error('Error in declineMissionHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
