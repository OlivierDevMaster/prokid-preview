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

  const session = await stripe.checkout.sessions.create({
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
      trial_period_days: SubscriptionConfig.TRIAL_PERIOD_DAYS,
    },
    success_url: successUrl,
  });

  return session;
};

export const getSubscriptionStatus = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<SubscriptionStatusResponse> => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('professional_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch subscription: ${error.message}`);
  }

  const isSubscribed =
    subscription !== null &&
    (subscription.status === 'active' || subscription.status === 'trialing');

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
): Promise<ProfessionalSubscription> => {
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('professional_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError || !subscription) {
    throw new Error('No active subscription found');
  }

  const stripeSubscription = await stripe.subscriptions.update(
    subscription.stripe_subscription_id,
    {
      cancel_at_period_end: cancelAtPeriodEnd,
    }
  );

  const updateData: ProfessionalSubscriptionUpdate = {
    cancel_at_period_end: cancelAtPeriodEnd,
    current_period_end: new Date(
      stripeSubscription.current_period_end * 1000
    ).toISOString(),
    current_period_start: new Date(
      stripeSubscription.current_period_start * 1000
    ).toISOString(),
    status: stripeSubscription.status as SubscriptionStatus,
  };

  if (!cancelAtPeriodEnd) {
    updateData.canceled_at = new Date().toISOString();
    updateData.status = 'canceled' as SubscriptionStatus;
  }

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

  const updateData: ProfessionalSubscriptionUpdate = {
    cancel_at_period_end: false,
    canceled_at: null,
    current_period_end: new Date(
      stripeSubscription.current_period_end * 1000
    ).toISOString(),
    current_period_start: new Date(
      stripeSubscription.current_period_start * 1000
    ).toISOString(),
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
  stripe: Stripe,
  supabase: SupabaseClient<Database>,
  stripeSubscription: Stripe.Subscription
): Promise<ProfessionalSubscription> => {
  const userId = stripeSubscription.metadata.user_id;

  if (!userId) {
    throw new Error('Subscription metadata missing user_id');
  }

  const subscriptionData: ProfessionalSubscriptionInsert = {
    cancel_at_period_end: stripeSubscription.cancel_at_period_end ?? false,
    canceled_at: stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
      : null,
    current_period_end: new Date(
      stripeSubscription.current_period_end * 1000
    ).toISOString(),
    current_period_start: new Date(
      stripeSubscription.current_period_start * 1000
    ).toISOString(),
    professional_id: userId,
    status: stripeSubscription.status as SubscriptionStatus,
    stripe_price_id: stripeSubscription.items.data[0]?.price.id ?? '',
    stripe_subscription_id: stripeSubscription.id,
    trial_end: stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000).toISOString()
      : null,
    trial_start: stripeSubscription.trial_start
      ? new Date(stripeSubscription.trial_start * 1000).toISOString()
      : null,
  };

  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscription.id)
    .maybeSingle();

  if (existingSubscription) {
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSubscription.id)
      .select('*')
      .single();

    if (updateError || !updatedSubscription) {
      throw new Error(
        `Failed to update subscription: ${updateError?.message ?? 'Unknown error'}`
      );
    }

    return updatedSubscription;
  }

  const { data: newSubscription, error: insertError } = await supabase
    .from('subscriptions')
    .insert(subscriptionData)
    .select('*')
    .single();

  if (insertError || !newSubscription) {
    throw new Error(
      `Failed to create subscription: ${insertError?.message ?? 'Unknown error'}`
    );
  }

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
