-- Migration: create_subscriptions
-- Purpose: Create subscriptions table to track Stripe subscription status
-- Affected tables: subscriptions
-- Dependencies: Requires professionals table to exist

-- ============================================================================
-- Model: subscriptions
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "professional_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE,
  "stripe_subscription_id" TEXT NOT NULL UNIQUE,
  "stripe_price_id" TEXT NOT NULL,
  "status" "public"."subscription_status" NOT NULL,
  "current_period_start" TIMESTAMP WITH TIME ZONE,
  "current_period_end" TIMESTAMP WITH TIME ZONE,
  "trial_start" TIMESTAMP WITH TIME ZONE,
  "trial_end" TIMESTAMP WITH TIME ZONE,
  "cancel_at_period_end" BOOLEAN DEFAULT FALSE NOT NULL,
  "canceled_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Comments
COMMENT ON TABLE "public"."subscriptions" IS 'Tracks Stripe subscription status for professionals';
COMMENT ON COLUMN "public"."subscriptions"."professional_id" IS 'Reference to the professional user';
COMMENT ON COLUMN "public"."subscriptions"."stripe_subscription_id" IS 'Stripe subscription ID (unique)';
COMMENT ON COLUMN "public"."subscriptions"."stripe_price_id" IS 'Stripe price ID for the subscription';
COMMENT ON COLUMN "public"."subscriptions"."status" IS 'Current subscription status from Stripe';
COMMENT ON COLUMN "public"."subscriptions"."current_period_start" IS 'Start of current billing period';
COMMENT ON COLUMN "public"."subscriptions"."current_period_end" IS 'End of current billing period';
COMMENT ON COLUMN "public"."subscriptions"."trial_start" IS 'Start of trial period';
COMMENT ON COLUMN "public"."subscriptions"."trial_end" IS 'End of trial period';
COMMENT ON COLUMN "public"."subscriptions"."cancel_at_period_end" IS 'Whether subscription will cancel at period end';
COMMENT ON COLUMN "public"."subscriptions"."canceled_at" IS 'Timestamp when subscription was canceled';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_subscriptions_professional_id" ON "public"."subscriptions" ("professional_id");
CREATE INDEX IF NOT EXISTS "idx_subscriptions_stripe_subscription_id" ON "public"."subscriptions" ("stripe_subscription_id");
CREATE INDEX IF NOT EXISTS "idx_subscriptions_status" ON "public"."subscriptions" ("status");
CREATE INDEX IF NOT EXISTS "idx_subscriptions_professional_status" ON "public"."subscriptions" ("professional_id", "status");

-- Triggers
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON "public"."subscriptions"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;

-- Professionals can view their own subscription
CREATE POLICY "Professionals can view their own subscription" ON "public"."subscriptions"
  FOR SELECT
  TO authenticated
  USING (
    "professional_id" = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'professional'
    )
  );

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON "public"."subscriptions"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Only service role can insert/update/delete (via Edge Functions)
-- This is enforced by not creating policies for INSERT/UPDATE/DELETE
-- Edge Functions use service role key which bypasses RLS
