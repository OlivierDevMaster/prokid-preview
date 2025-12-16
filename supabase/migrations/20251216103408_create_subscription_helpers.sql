-- Migration: create_subscription_helpers
-- Purpose: Create helper functions for subscription status checks
-- Affected objects: is_professional_subscribed function
-- Dependencies: Requires subscriptions table to exist

-- ============================================================================
-- Function: is_professional_subscribed
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_professional_subscribed(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE professional_id = user_id_param
    AND status IN ('active', 'trialing')
    AND (
      cancel_at_period_end = false
      OR cancel_at_period_end IS NULL
      OR (cancel_at_period_end = true AND current_period_end > NOW())
    )
  );
END;
$$;

COMMENT ON FUNCTION public.is_professional_subscribed(UUID) IS 'Checks if a professional has an active or trialing subscription. Returns true if subscription status is active or trialing and either not scheduled to cancel, or scheduled to cancel but current period has not ended yet.';
