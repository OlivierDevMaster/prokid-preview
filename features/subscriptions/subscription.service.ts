import { createClient } from '@/lib/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

import type {
  CreateCheckoutSessionRequestBody,
  CreateCheckoutSessionResponse,
  CreatePortalSessionRequestBody,
  CreatePortalSessionResponse,
  SubscriptionStatusResponse,
} from './subscription.model';

export const createCheckoutSession = async (
  body: CreateCheckoutSessionRequestBody
): Promise<CreateCheckoutSessionResponse> => {
  const supabase = createClient();

  return invokeEdgeFunction<
    CreateCheckoutSessionResponse,
    CreateCheckoutSessionRequestBody
  >(supabase, 'subscriptions/checkout', {
    body,
    method: 'POST',
  });
};

export const getSubscriptionStatus =
  async (): Promise<SubscriptionStatusResponse> => {
    const supabase = createClient();

    return invokeEdgeFunction<SubscriptionStatusResponse>(
      supabase,
      'subscriptions/status',
      {
        method: 'GET',
      }
    );
  };

export const createPortalSession = async (
  body: CreatePortalSessionRequestBody
): Promise<CreatePortalSessionResponse> => {
  const supabase = createClient();

  return invokeEdgeFunction<
    CreatePortalSessionResponse,
    CreatePortalSessionRequestBody
  >(supabase, 'subscriptions/portal', {
    body,
    method: 'POST',
  });
};
