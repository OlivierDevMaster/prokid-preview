import { createFactory } from '@hono/hono/factory';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

import { getStripeClient } from '../../_shared/features/stripe/stripe.util.ts';
import { syncSubscriptionFromStripe } from '../../_shared/features/subscriptions/index.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = Record<string, never>;

const factory = createFactory<{ Variables: Variables }>();

const createAdminClient = () => {
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

export const webhookHandler = factory.createHandlers(async ({ req }) => {
  try {
    const stripe = getStripeClient();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return apiResponse.internalServerError('Webhook secret not configured');
    }

    const signature = req.header('stripe-signature');

    if (!signature) {
      return apiResponse.badRequest('Missing stripe-signature header');
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return apiResponse.badRequest(
        `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }

    const supabaseAdminClient = createAdminClient();

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(
          stripe,
          supabaseAdminClient,
          subscription
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;

        if (userId) {
          await supabaseAdminClient
            .from('subscriptions')
            .update({
              canceled_at: new Date().toISOString(),
              status: 'canceled',
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionFromStripe(
          stripe,
          supabaseAdminClient,
          subscription
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            typeof invoice.subscription === 'string'
              ? invoice.subscription
              : invoice.subscription.id
          );
          await syncSubscriptionFromStripe(
            stripe,
            supabaseAdminClient,
            stripeSubscription
          );
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            typeof invoice.subscription === 'string'
              ? invoice.subscription
              : invoice.subscription.id
          );
          await syncSubscriptionFromStripe(
            stripe,
            supabaseAdminClient,
            stripeSubscription
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return apiResponse.ok({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return apiResponse.internalServerError(
      error instanceof Error ? error.message : 'Error processing webhook'
    );
  }
});
