import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { isProfileProfessional } from '../../_shared/features/profiles/index.ts';
import { findProfile } from '../../_shared/features/profiles/index.ts';
import { getStripeClient } from '../../_shared/features/stripe/stripe.util.ts';
import {
  createCheckoutSession,
  CreateCheckoutSessionRequestBodySchema,
  getSubscriptionStatus,
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

export const createCheckoutSessionHandler = factory.createHandlers(
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
          'Only professionals can create checkout sessions'
        );
      }

      const subscriptionStatus = await getSubscriptionStatus(
        supabaseClient,
        user.id
      );

      if (subscriptionStatus.isSubscribed) {
        return apiResponse.conflict(
          'ALREADY_SUBSCRIBED',
          'You already have an active subscription. Please manage your existing subscription instead.'
        );
      }

      const validationResult = await validateRequestBody(
        CreateCheckoutSessionRequestBodySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const body = validationResult.data;
      const stripe = getStripeClient();
      const session = await createCheckoutSession(
        stripe,
        supabaseClient,
        user.id,
        body.successUrl,
        body.cancelUrl
      );

      return apiResponse.ok({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return apiResponse.internalServerError(
        error instanceof Error
          ? error.message
          : 'Error creating checkout session'
      );
    }
  }
);
