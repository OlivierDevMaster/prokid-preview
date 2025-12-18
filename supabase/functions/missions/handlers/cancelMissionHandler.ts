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

export const cancelMissionHandler = factory.createHandlers(
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

      // Verify structure owns the mission
      if (mission.structure_id !== userId) {
        return apiResponse.forbidden(
          'Only the creating structure can cancel this mission'
        );
      }

      // Verify mission is not already cancelled, expired, or ended
      if (mission.status === 'cancelled') {
        return apiResponse.badRequest(
          'INVALID_STATUS',
          'Mission is already cancelled'
        );
      }
      if (mission.status === 'expired') {
        return apiResponse.badRequest(
          'INVALID_STATUS',
          'Cannot cancel an expired mission. The mission start date has passed and the mission has expired.'
        );
      }
      if (mission.status === 'ended') {
        return apiResponse.badRequest(
          'INVALID_STATUS',
          'Cannot cancel an ended mission. The mission end date has passed and the mission has ended.'
        );
      }

      // Update mission status
      const { data: updatedMission, error: updateError } =
        await supabaseAdminClient
          .from('missions')
          .update({ status: 'cancelled' })
          .eq('id', missionId)
          .select('*')
          .single();

      if (updateError) {
        console.error('Error updating mission:', updateError);
        return apiResponse.internalServerError('Failed to cancel mission');
      }

      // TODO: If mission was accepted, restore availability (remove UNTIL)
      // This can be implemented later if needed

      return apiResponse.ok(updatedMission as Mission);
    } catch (error) {
      console.error('Error in cancelMissionHandler:', error);
      return apiResponse.internalServerError();
    }
  }
);
