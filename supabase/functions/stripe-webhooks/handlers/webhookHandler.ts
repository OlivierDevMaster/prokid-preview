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
    // Get raw body for signature verification
    // Stripe requires the raw body (as string) to verify the webhook signature
    let rawBody: string;
    try {
      rawBody = await req.text();
    } catch (error) {
      console.error('Error reading request body:', error);
      return apiResponse.badRequest(
        'INVALID_REQUEST_BODY',
        'Impossible de lire le corps de la requête'
      );
    }

    if (!rawBody || rawBody.length === 0) {
      return apiResponse.badRequest(
        'MISSING_REQUEST_BODY',
        'Le corps de la requête est requis'
      );
    }

    // Verify webhook signature
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!stripeWebhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return apiResponse.internalServerError(
        'Configuration webhook Stripe manquante'
      );
    }

    // Get Stripe signature from headers
    const stripeSignature = req.header('stripe-signature');
    if (!stripeSignature) {
      return apiResponse.badRequest(
        'MISSING_STRIPE_SIGNATURE',
        'Signature Stripe manquante dans les en-têtes'
      );
    }

    // Initialize Stripe client for signature verification
    let stripe: Stripe;
    try {
      stripe = getStripeClient();
    } catch (error) {
      console.error('Stripe initialization error:', error);
      return apiResponse.internalServerError(
        error instanceof Error
          ? error.message
          : 'Configuration Stripe manquante'
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        stripeSignature,
        stripeWebhookSecret
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return apiResponse.badRequest(
        'INVALID_WEBHOOK_SIGNATURE',
        'Signature webhook invalide'
      );
    }

    const supabaseAdminClient = createAdminClient();

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('subscription', subscription);
        console.log(`[${event.type}] Processing subscription:`, {
          cancelAt: subscription.cancel_at,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at,
          cancellationDetails: subscription.cancellation_details,
          currentPeriodEnd:
            subscription.items?.data?.[0]?.current_period_end ?? null,
          eventId: event.id,
          metadata: subscription.metadata,
          status: subscription.status,
          subscriptionId: subscription.id,
        });
        try {
          const result = await syncSubscriptionFromStripe(
            stripe,
            supabaseAdminClient,
            subscription
          );
          console.log(`[${event.type}] Subscription synced successfully:`, {
            cancelAtPeriodEnd: result.cancel_at_period_end,
            dbId: result.id,
            status: result.status,
            subscriptionId: subscription.id,
          });
        } catch (error) {
          console.error(`[${event.type}] Error syncing subscription:`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            subscriptionId: subscription.id,
          });
          throw error;
        }
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
        console.log('invoice', invoice);
        const subscriptionRef =
          invoice.parent?.subscription_details?.subscription;
        if (subscriptionRef) {
          const subscriptionId =
            typeof subscriptionRef === 'string'
              ? subscriptionRef
              : subscriptionRef.id;
          const stripeSubscription =
            await stripe.subscriptions.retrieve(subscriptionId);
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
        console.log('invoice payment succeeded', invoice);
        const subscriptionRef =
          invoice.parent?.subscription_details?.subscription;
        if (subscriptionRef) {
          const subscriptionId =
            typeof subscriptionRef === 'string'
              ? subscriptionRef
              : subscriptionRef.id;
          const stripeSubscription =
            await stripe.subscriptions.retrieve(subscriptionId);
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
