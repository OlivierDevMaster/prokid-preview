import Stripe from 'stripe';

/**
 * Get Stripe client instance
 * Throws error if STRIPE_SECRET_KEY is not configured
 */
export const getStripeClient = (): Stripe => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

  if (!stripeSecretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is not configured. ' +
        'Please set STRIPE_SECRET_KEY in your Supabase project settings.'
    );
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2025-11-17.clover',
  });
};
