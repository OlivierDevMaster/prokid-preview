-- Migration: schedule_expire_professionals_availability
-- Purpose: Schedule a pg_cron job to automatically expire professionals availability windows
-- Affected tables: professionals
-- Dependencies: pg_cron extension enabled

-- ============================================================================
-- Function: expire professionals availability
-- ============================================================================

CREATE OR REPLACE FUNCTION public.expire_professionals_availability()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  UPDATE public.professionals
  SET
    is_available = FALSE,
    availability_start = NULL,
    availability_end = NULL
  WHERE is_available = TRUE
    AND availability_end IS NOT NULL
    AND availability_end < NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

COMMENT ON FUNCTION public.expire_professionals_availability() IS 'Expires timed availability windows for professionals (availability_end < now) and marks them unavailable. Returns number of updated rows.';

-- ============================================================================
-- Cron Job: run every minute
-- ============================================================================

-- Ensure job is not duplicated if migration is re-applied
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'expire-professionals-availability';
SELECT cron.schedule(
  'expire-professionals-availability',
  '* * * * *',
  $$SELECT public.expire_professionals_availability()$$
);

