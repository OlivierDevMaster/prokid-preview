-- Seed: subscriptions
-- Purpose: Create subscription entries for all professionals
-- Note: Professionals must have subscriptions before accessing the app
-- All professionals are seeded with active subscriptions (some with trial periods)

-- Mock Stripe price ID for seed data (in production, this comes from STRIPE_PRICE_ID env var)
-- Format: price_xxxxxxxxxxxxx (Stripe price IDs start with 'price_')
-- Using a test/seed price ID format
DO $$
DECLARE
  seed_price_id TEXT := 'price_seed_test_1234567890abcdef';
  professional_ids UUID[] := ARRAY[
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'::uuid,
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'::uuid,
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'::uuid,
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'::uuid,
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'::uuid,
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae7'::uuid,
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'::uuid,
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae9'::uuid,
    '08fb0a72-ee9b-4771-bf24-7fe19c869aea'::uuid,
    '08fb0a72-ee9b-4771-bf24-7fe19c869aeb'::uuid
  ];
  prof_id UUID;
  sub_id TEXT;
  status_val TEXT;
  trial_start_val TIMESTAMP WITH TIME ZONE;
  trial_end_val TIMESTAMP WITH TIME ZONE;
  period_start_val TIMESTAMP WITH TIME ZONE;
  period_end_val TIMESTAMP WITH TIME ZONE;
  idx INT := 0;
BEGIN
  FOREACH prof_id IN ARRAY professional_ids
  LOOP
    idx := idx + 1;
    -- Generate unique mock Stripe subscription ID
    sub_id := 'sub_seed_' || LPAD(idx::TEXT, 3, '0') || '_' || REPLACE(prof_id::TEXT, '-', '');

    -- First 5 professionals are in trial period (trialing status)
    -- Next 10 are active (past trial)
    -- Last 5 are active (recently started)
    IF idx <= 5 THEN
      -- Trialing: currently in 90-day trial period
      status_val := 'trialing';
      trial_start_val := NOW() - INTERVAL '30 days'; -- Started 30 days ago
      trial_end_val := NOW() + INTERVAL '60 days'; -- 60 days remaining
      period_start_val := trial_start_val;
      period_end_val := trial_end_val;
    ELSIF idx <= 15 THEN
      -- Active: past trial, regular subscription
      status_val := 'active';
      trial_start_val := NOW() - INTERVAL '120 days'; -- Trial ended 30 days ago
      trial_end_val := NOW() - INTERVAL '30 days';
      period_start_val := NOW() - INTERVAL '10 days'; -- Current period started 10 days ago
      period_end_val := NOW() + INTERVAL '20 days'; -- 20 days remaining in period
    ELSE
      -- Active: recently started, just past trial
      status_val := 'active';
      trial_start_val := NOW() - INTERVAL '95 days'; -- Trial ended 5 days ago
      trial_end_val := NOW() - INTERVAL '5 days';
      period_start_val := NOW() - INTERVAL '5 days'; -- Current period started 5 days ago
      period_end_val := NOW() + INTERVAL '25 days'; -- 25 days remaining in period
    END IF;

    -- Insert subscription
    INSERT INTO public.subscriptions (
      professional_id,
      stripe_subscription_id,
      stripe_price_id,
      status,
      current_period_start,
      current_period_end,
      trial_start,
      trial_end,
      cancel_at_period_end,
      canceled_at
    ) VALUES (
      prof_id,
      sub_id,
      seed_price_id,
      status_val::public.subscription_status,
      period_start_val,
      period_end_val,
      trial_start_val,
      trial_end_val,
      FALSE,
      NULL
    ) ON CONFLICT (stripe_subscription_id) DO NOTHING;
  END LOOP;
END $$;
