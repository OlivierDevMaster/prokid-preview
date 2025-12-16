-- Migration: add_trial_tracking_to_professionals
-- Purpose: Add has_used_trial column to professionals table and create trigger to automatically update it
-- Affected tables: professionals, subscriptions
-- Dependencies: Requires professionals and subscriptions tables to exist

-- ============================================================================
-- Add has_used_trial column to professionals table
-- ============================================================================

ALTER TABLE "public"."professionals"
ADD COLUMN IF NOT EXISTS "has_used_trial" BOOLEAN DEFAULT FALSE NOT NULL;

COMMENT ON COLUMN "public"."professionals"."has_used_trial" IS 'Indicates if the professional has ever used a free trial. Automatically updated by trigger when subscriptions are created or updated. Cannot be modified by professionals.';

-- Create index for performance
CREATE INDEX IF NOT EXISTS "idx_professionals_has_used_trial" ON "public"."professionals" ("has_used_trial");

-- ============================================================================
-- Function: update_professional_trial_status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_professional_trial_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update has_used_trial to true if trial_start is set
  IF NEW.trial_start IS NOT NULL THEN
    UPDATE public.professionals
    SET has_used_trial = TRUE
    WHERE user_id = NEW.professional_id
    AND has_used_trial = FALSE;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_professional_trial_status() IS 'Trigger function that automatically updates has_used_trial column in professionals table when a subscription with trial_start is created or updated.';

-- ============================================================================
-- Trigger: update_professional_trial_status_on_subscription
-- ============================================================================

CREATE TRIGGER update_professional_trial_status_on_subscription
  AFTER INSERT OR UPDATE OF trial_start ON "public"."subscriptions"
  FOR EACH ROW
  WHEN (NEW.trial_start IS NOT NULL)
  EXECUTE FUNCTION public.update_professional_trial_status();

-- ============================================================================
-- Function: prevent_trial_status_update
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_trial_status_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If has_used_trial is being changed and user is not admin, prevent the change
  IF OLD.has_used_trial IS DISTINCT FROM NEW.has_used_trial THEN
    IF NOT (SELECT public.is_admin()) THEN
      -- Reset has_used_trial to its original value
      NEW.has_used_trial := OLD.has_used_trial;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.prevent_trial_status_update() IS 'Trigger function that prevents non-admin users from updating has_used_trial column. Automatically resets the value if changed by non-admin.';

-- ============================================================================
-- Trigger: prevent_trial_status_update_on_professionals
-- ============================================================================

CREATE TRIGGER prevent_trial_status_update_on_professionals
  BEFORE UPDATE ON "public"."professionals"
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_trial_status_update();

-- ============================================================================
-- Backfill existing data
-- ============================================================================

-- Update has_used_trial for professionals who already have subscriptions with trials
UPDATE public.professionals
SET has_used_trial = TRUE
WHERE user_id IN (
  SELECT DISTINCT professional_id
  FROM public.subscriptions
  WHERE trial_start IS NOT NULL
)
AND has_used_trial = FALSE;
