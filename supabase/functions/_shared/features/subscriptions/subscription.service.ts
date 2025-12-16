import { type SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

import type {
  ProfessionalSubscription,
  ProfessionalSubscriptionInsert,
  ProfessionalSubscriptionUpdate,
  SubscriptionStatus,
  SubscriptionStatusResponse,
} from './subscription.model.ts';

import { Database } from '../../../../../types/database/schema.ts';
import { getOrCreateProfessionalStripeCustomerId } from '../stripe/stripe.service.ts';
import {
  getSubscriptionPriceId,
  SubscriptionConfig,
} from './subscription.config.ts';

export const isProfessionalSubscribed = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('is_professional_subscribed', {
    user_id_param: userId,
  });

  if (error) {
    throw new Error(`Failed to check subscription status: ${error.message}`);
  }

  return data ?? false;
};

export const hasUsedTrial = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('professionals')
    .select('has_used_trial')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to check trial usage: ${error.message}`);
  }

  return data?.has_used_trial ?? false;
};

export const createCheckoutSession = async (
  stripe: Stripe,
  supabase: SupabaseClient<Database>,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> => {
  const customerId = await getOrCreateProfessionalStripeCustomerId(
    stripe,
    supabase,
    userId
  );

  const priceId = getSubscriptionPriceId();
  const hasTrialBeenUsed = await hasUsedTrial(supabase, userId);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    cancel_url: cancelUrl,
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId,
    },
    mode: 'subscription',
    subscription_data: {
      metadata: {
        user_id: userId,
      },
      ...(hasTrialBeenUsed
        ? {}
        : { trial_period_days: SubscriptionConfig.TRIAL_PERIOD_DAYS }),
    },
    success_url: successUrl,
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  return session;
};

export const getSubscriptionStatus = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<SubscriptionStatusResponse> => {
  const [subscriptionResult, isSubscribedResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*')
      .eq('professional_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.rpc('is_professional_subscribed', {
      user_id_param: userId,
    }),
  ]);

  if (subscriptionResult.error) {
    throw new Error(
      `Failed to fetch subscription: ${subscriptionResult.error.message}`
    );
  }

  if (isSubscribedResult.error) {
    throw new Error(
      `Failed to check subscription status: ${isSubscribedResult.error.message}`
    );
  }

  const subscription = subscriptionResult.data;
  const isSubscribed = isSubscribedResult.data ?? false;

  return {
    isSubscribed,
    status: subscription?.status ?? null,
    subscription: subscription ?? null,
  };
};

export const cancelSubscription = async (
  stripe: Stripe,
  supabase: SupabaseClient<Database>,
  userId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<{ message: string; stripeSubscriptionId: string }> => {
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('professional_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to fetch subscription: ${fetchError.message}`);
  }

  if (!subscription) {
    throw new Error('No subscription found');
  }

  if (subscription.status === 'canceled') {
    throw new Error('Subscription is already canceled');
  }

  if (
    subscription.status === 'incomplete_expired' ||
    subscription.status === 'unpaid'
  ) {
    throw new Error('Subscription has already ended and cannot be canceled');
  }

  if (subscription.cancel_at_period_end) {
    throw new Error(
      'Subscription is already scheduled to cancel at period end'
    );
  }

  if (
    subscription.status !== 'active' &&
    subscription.status !== 'trialing' &&
    subscription.status !== 'past_due'
  ) {
    throw new Error(
      `Cannot cancel subscription with status: ${subscription.status}`
    );
  }

  let stripeSubscription: Stripe.Subscription;

  if (cancelAtPeriodEnd) {
    stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );
  } else {
    stripeSubscription = await stripe.subscriptions.cancel(
      subscription.stripe_subscription_id
    );
  }

  return {
    message: cancelAtPeriodEnd
      ? 'Subscription will be canceled at the end of the current period. The database will be updated via webhook.'
      : 'Subscription has been canceled. The database will be updated via webhook.',
    stripeSubscriptionId: stripeSubscription.id,
  };
};

export const reactivateSubscription = async (
  stripe: Stripe,
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ProfessionalSubscription> => {
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('professional_id', userId)
    .in('status', ['canceled', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError || !subscription) {
    throw new Error('No canceled or past_due subscription found');
  }

  const stripeSubscription = await stripe.subscriptions.update(
    subscription.stripe_subscription_id,
    {
      cancel_at_period_end: false,
    }
  );

  const subscriptionItem = stripeSubscription.items.data[0];
  const updateData: ProfessionalSubscriptionUpdate = {
    cancel_at_period_end: false,
    canceled_at: null,
    current_period_end: subscriptionItem?.current_period_end
      ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
      : null,
    current_period_start: subscriptionItem?.current_period_start
      ? new Date(subscriptionItem.current_period_start * 1000).toISOString()
      : null,
    status: stripeSubscription.status as SubscriptionStatus,
  };

  const { data: updatedSubscription, error: updateError } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('id', subscription.id)
    .select('*')
    .single();

  if (updateError || !updatedSubscription) {
    throw new Error(
      `Failed to update subscription: ${updateError?.message ?? 'Unknown error'}`
    );
  }

  return updatedSubscription;
};

export const syncSubscriptionFromStripe = async (
  _stripe: Stripe,
  supabase: SupabaseClient<Database>,
  stripeSubscription: Stripe.Subscription
): Promise<ProfessionalSubscription> => {
  console.log('[syncSubscriptionFromStripe] Starting sync:', {
    cancelAt: stripeSubscription.cancel_at,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    canceledAt: stripeSubscription.canceled_at,
    cancellationDetails: stripeSubscription.cancellation_details,
    status: stripeSubscription.status,
    subscriptionId: stripeSubscription.id,
  });

  const userId = stripeSubscription.metadata.user_id;
  console.log('[syncSubscriptionFromStripe] Extracted metadata:', {
    allMetadata: stripeSubscription.metadata,
    userId,
  });

  if (!userId) {
    console.error('[syncSubscriptionFromStripe] Missing user_id in metadata');
    throw new Error('Subscription metadata missing user_id');
  }

  const subscriptionItem = stripeSubscription.items.data[0];
  console.log('[syncSubscriptionFromStripe] Subscription item:', {
    currentPeriodEnd: subscriptionItem?.current_period_end,
    currentPeriodStart: subscriptionItem?.current_period_start,
    itemId: subscriptionItem?.id,
    priceId: subscriptionItem?.price.id,
  });

  // If cancel_at is set, it means the subscription is scheduled to cancel
  // This happens when canceling through customer portal even if cancel_at_period_end is false
  const isScheduledToCancel = !!(
    stripeSubscription.cancel_at_period_end ||
    (stripeSubscription.cancel_at !== null &&
      subscriptionItem?.current_period_end &&
      stripeSubscription.cancel_at === subscriptionItem.current_period_end)
  );

  console.log('[syncSubscriptionFromStripe] Cancellation analysis:', {
    cancelAt: stripeSubscription.cancel_at,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    currentPeriodEnd: subscriptionItem?.current_period_end,
    isScheduledToCancel,
  });

  const subscriptionData: ProfessionalSubscriptionInsert = {
    cancel_at_period_end: isScheduledToCancel,
    canceled_at: stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
      : null,
    current_period_end: subscriptionItem?.current_period_end
      ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
      : null,
    current_period_start: subscriptionItem?.current_period_start
      ? new Date(subscriptionItem.current_period_start * 1000).toISOString()
      : null,
    professional_id: userId,
    status: stripeSubscription.status,
    stripe_price_id: stripeSubscription.items.data[0]?.price.id ?? '',
    stripe_subscription_id: stripeSubscription.id,
    trial_end: stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000).toISOString()
      : null,
    trial_start: stripeSubscription.trial_start
      ? new Date(stripeSubscription.trial_start * 1000).toISOString()
      : null,
  };

  console.log('[syncSubscriptionFromStripe] Prepared subscription data:', {
    ...subscriptionData,
    canceled_at: subscriptionData.canceled_at,
    current_period_end: subscriptionData.current_period_end,
    current_period_start: subscriptionData.current_period_start,
  });

  const { data: existingSubscription, error: findError } = await supabase
    .from('subscriptions')
    .select('id, status, cancel_at_period_end, canceled_at')
    .eq('stripe_subscription_id', stripeSubscription.id)
    .maybeSingle();

  if (findError) {
    console.error(
      '[syncSubscriptionFromStripe] Error finding existing subscription:',
      {
        code: findError.code,
        error: findError.message,
      }
    );
  }

  console.log('[syncSubscriptionFromStripe] Existing subscription lookup:', {
    existingCancelAtPeriodEnd: existingSubscription?.cancel_at_period_end,
    existingCanceledAt: existingSubscription?.canceled_at,
    existingId: existingSubscription?.id,
    existingStatus: existingSubscription?.status,
    found: !!existingSubscription,
  });

  if (existingSubscription) {
    console.log(
      '[syncSubscriptionFromStripe] Updating existing subscription:',
      {
        dbId: existingSubscription.id,
        newCancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
        newStatus: subscriptionData.status,
        oldCancelAtPeriodEnd: existingSubscription.cancel_at_period_end,
        oldStatus: existingSubscription.status,
      }
    );

    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSubscription.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('[syncSubscriptionFromStripe] Update error:', {
        code: updateError.code,
        details: updateError.details,
        error: updateError.message,
        hint: updateError.hint,
      });
      throw new Error(
        `Failed to update subscription: ${updateError.message ?? 'Unknown error'}`
      );
    }

    if (!updatedSubscription) {
      console.error('[syncSubscriptionFromStripe] Update returned no data');
      throw new Error('Failed to update subscription: No data returned');
    }

    console.log('[syncSubscriptionFromStripe] Update successful:', {
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      canceledAt: updatedSubscription.canceled_at,
      dbId: updatedSubscription.id,
      status: updatedSubscription.status,
    });

    return updatedSubscription;
  }

  console.log('[syncSubscriptionFromStripe] Creating new subscription');
  const { data: newSubscription, error: insertError } = await supabase
    .from('subscriptions')
    .insert(subscriptionData)
    .select('*')
    .single();

  if (insertError) {
    console.error('[syncSubscriptionFromStripe] Insert error:', {
      code: insertError.code,
      details: insertError.details,
      error: insertError.message,
      hint: insertError.hint,
    });
    throw new Error(
      `Failed to create subscription: ${insertError.message ?? 'Unknown error'}`
    );
  }

  if (!newSubscription) {
    console.error('[syncSubscriptionFromStripe] Insert returned no data');
    throw new Error('Failed to create subscription: No data returned');
  }

  console.log('[syncSubscriptionFromStripe] Insert successful:', {
    dbId: newSubscription.id,
    status: newSubscription.status,
  });

  return newSubscription;
};

export const createPortalSession = async (
  stripe: Stripe,
  supabase: SupabaseClient<Database>,
  userId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> => {
  const { data: professional, error } = await supabase
    .from('professionals')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !professional?.stripe_customer_id) {
    throw new Error('Professional not found or missing Stripe customer ID');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: professional.stripe_customer_id,
    return_url: returnUrl,
  });

  return session;
};
