import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { isProfileProfessional } from '../../_shared/features/profiles/index.ts';
import { findProfile } from '../../_shared/features/profiles/index.ts';
import { getStripeClient } from '../../_shared/features/stripe/stripe.util.ts';
import {
  cancelSubscription,
  CancelSubscriptionRequestBodySchema,
} from '../../_shared/features/subscriptions/index.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const cancelSubscriptionHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      const user = get('user');
      const supabaseClient = get('supabaseClient');

      const profile = await findProfile(supabaseClient, user.id);

      if (!profile) {
        return apiResponse.unauthorized();
      }

      if (!isProfileProfessional(profile)) {
        return apiResponse.forbidden(
          'Only professionals can cancel subscriptions'
        );
      }

      const validationResult = await validateRequestBody(
        CancelSubscriptionRequestBodySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const body = validationResult.data;
      const stripe = getStripeClient();
      const canceledSubscription = await cancelSubscription(
        stripe,
        supabaseClient,
        user.id,
        body.cancelAtPeriodEnd
      );

      return apiResponse.ok(canceledSubscription);
    } catch (error) {
      console.error('Error canceling subscription:', error);

      if (!(error instanceof Error)) {
        return apiResponse.internalServerError('Error canceling subscription');
      }

      const errorMessage = error.message;

      if (errorMessage === 'No subscription found') {
        return apiResponse.notFound(errorMessage);
      }

      if (
        errorMessage === 'Subscription is already canceled' ||
        errorMessage ===
          'Subscription has already ended and cannot be canceled' ||
        errorMessage ===
          'Subscription is already scheduled to cancel at period end' ||
        errorMessage.startsWith('Cannot cancel subscription with status:')
      ) {
        return apiResponse.badRequest(
          'SUBSCRIPTION_CANNOT_BE_CANCELED',
          errorMessage
        );
      }

      return apiResponse.internalServerError(errorMessage);
    }
  }
);
