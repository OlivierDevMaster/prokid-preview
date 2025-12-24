export const SubscriptionConfig = {
  SUBSCRIPTION_AMOUNT_CENTS: 999,
  SUBSCRIPTION_CURRENCY: 'eur',
  SUBSCRIPTION_INTERVAL: 'month' as const,
  TRIAL_PERIOD_DAYS: 90,
} as const;

export const getSubscriptionPriceId = (): string => {
  const priceId = Deno.env.get('STRIPE_PRICE_ID');
  if (!priceId) {
    throw new Error(
      'STRIPE_PRICE_ID environment variable is not configured. ' +
        'Please set STRIPE_PRICE_ID in your Supabase project settings.'
    );
  }
  return priceId;
};
