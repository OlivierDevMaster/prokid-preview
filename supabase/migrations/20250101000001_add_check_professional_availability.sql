-- Migration: add_check_professional_availability
-- Purpose: Create a database function to check if a professional has an active mission
--          without exposing mission details, bypassing RLS for availability checks
-- Affected objects: check_professional_availability function

-- ============================================================================
-- Function: check_professional_availability
-- ============================================================================
-- This function allows anyone (structures, professionals, public users) to check
-- if a professional is currently on an active mission, without exposing mission details.
--
-- Security:
-- - Uses SECURITY DEFINER to bypass RLS when checking missions
-- - Returns only a boolean, no mission data is exposed
-- - Only checks accepted missions within the current date range
-- - No authentication required - can be called by anyone
--
-- Returns:
-- - TRUE if the professional has an active (accepted) mission
-- - FALSE if the professional has no active mission or if professional doesn't exist
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_professional_availability(
  professional_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  has_active_mission BOOLEAN;
  now_timestamp TIMESTAMP WITH TIME ZONE;
  professional_exists BOOLEAN;
BEGIN
  -- Verify the professional exists
  SELECT EXISTS (
    SELECT 1
    FROM public.professionals
    WHERE user_id = professional_id_param
  ) INTO professional_exists;

  -- If professional doesn't exist, return FALSE
  IF NOT professional_exists THEN
    RETURN FALSE;
  END IF;

  -- Get current timestamp
  now_timestamp := NOW();

  -- Check if professional has an active (accepted) mission
  -- A mission is active if:
  -- - status = 'accepted'
  -- - mission_dtstart <= now <= mission_until
  SELECT EXISTS (
    SELECT 1
    FROM public.missions
    WHERE professional_id = professional_id_param
    AND status = 'accepted'
    AND mission_dtstart <= now_timestamp
    AND mission_until >= now_timestamp
  ) INTO has_active_mission;

  RETURN has_active_mission;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return NULL on any exception
    RAISE WARNING 'Error in check_professional_availability: %', SQLERRM;
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.check_professional_availability(UUID) IS
'Checks if a professional has an active mission without exposing mission details. '
'Can be called by anyone (structures, professionals, public users). '
'Uses SECURITY DEFINER to bypass RLS. Returns TRUE if active mission exists, FALSE if not.';

