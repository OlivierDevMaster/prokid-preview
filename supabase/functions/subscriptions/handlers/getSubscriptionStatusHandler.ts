import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { isProfileProfessional } from '../../_shared/features/profiles/index.ts';
import { findProfile } from '../../_shared/features/profiles/index.ts';
import { getSubscriptionStatus } from '../../_shared/features/subscriptions/index.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const getSubscriptionStatusHandler = factory.createHandlers(
  async ({ get }) => {
    try {
      const user = get('user');
      const supabaseClient = get('supabaseClient');

      const profile = await findProfile(supabaseClient, user.id);

      if (!profile) {
        return apiResponse.unauthorized();
      }

      if (!isProfileProfessional(profile)) {
        return apiResponse.forbidden(
          'Only professionals can view subscription status'
        );
      }

      const status = await getSubscriptionStatus(supabaseClient, user.id);

      return apiResponse.ok(status);
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return apiResponse.internalServerError(
        error instanceof Error
          ? error.message
          : 'Error getting subscription status'
      );
    }
  }
);

