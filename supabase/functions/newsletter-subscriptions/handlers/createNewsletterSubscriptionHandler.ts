import { createFactory } from '@hono/hono/factory';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import {
  createNewsletterSubscription,
  CreateNewsletterSubscriptionRequestBodySchema,
} from '../../_shared/features/newsletterSubscriptions/index.ts';
import { validateRequestBody } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseClient: SupabaseClient<Database>;
};

const factory = createFactory<{ Variables: Variables }>();

const createAdminClient = (): SupabaseClient<Database> => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
    },
  });
};

export const createNewsletterSubscriptionHandler = factory.createHandlers(
  async ({ req }) => {
    try {
      const supabaseAdminClient = createAdminClient();

      const validationResult = await validateRequestBody(
        CreateNewsletterSubscriptionRequestBodySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const subscription = await createNewsletterSubscription(
        supabaseAdminClient,
        {
          email: validationResult.data.email,
          name: validationResult.data.name ?? null,
        }
      );

      return apiResponse.created(subscription);
    } catch (error) {
      console.error('Error creating newsletter subscription:', error);

      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === '23505'
      ) {
        return apiResponse.conflict(
          'EMAIL_ALREADY_SUBSCRIBED',
          'This email is already subscribed to the newsletter'
        );
      }

      return apiResponse.internalServerError(
        error instanceof Error
          ? error.message
          : 'Error creating newsletter subscription'
      );
    }
  }
);
