-- Migration: schedule_invitation_reminders_cron
-- Purpose: Schedule a pg_cron job to process invitation reminder emails (J+3, J+7, J+14, J+30)
-- Dependencies: pg_cron extension, pg_net extension, invitation_reminders table, vault secrets

-- ============================================================================
-- Function: process_invitation_reminders
-- Calls the process-invitation-reminders Edge Function via HTTP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.process_invitation_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  supabase_url TEXT;
  supabase_service_role_key TEXT;
  api_url TEXT;
  pending_count INTEGER := 0;
BEGIN
  -- First, mark reminders as sent for users who already completed onboarding
  UPDATE public.invitation_reminders ir
  SET sent_at = NOW()
  WHERE ir.sent_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = ir.profile_id
        AND (p.invitation_status = 'completed' OR p.is_onboarded = true)
    );

  -- Check if there are any pending reminders that are due
  SELECT COUNT(*) INTO pending_count
  FROM public.invitation_reminders
  WHERE sent_at IS NULL
    AND scheduled_at <= NOW();

  -- If no pending reminders, skip the HTTP call
  IF pending_count = 0 THEN
    RETURN 0;
  END IF;

  -- Get Supabase URL and service role key from vault
  supabase_url := public.get_vault_secret('supabase_url');
  supabase_service_role_key := public.get_vault_secret('supabase_service_role_key');

  IF supabase_url IS NULL THEN
    RAISE WARNING 'supabase_url from vault is not set, fallback to localhost';
    api_url := 'http://127.0.0.1:54321/functions/v1/process-invitation-reminders';
  ELSE
    api_url := supabase_url || '/functions/v1/process-invitation-reminders';
  END IF;

  IF supabase_service_role_key IS NULL THEN
    RAISE WARNING 'supabase_service_role_key from vault is not set';
    RETURN 0;
  END IF;

  -- Call Edge Function (fire-and-forget)
  BEGIN
    PERFORM net.http_post(
      api_url,
      '{}'::jsonb,
      '{}'::jsonb,
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_service_role_key,
        'apikey', supabase_service_role_key
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error calling process-invitation-reminders Edge Function: %', SQLERRM;
      RETURN 0;
  END;

  RETURN pending_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in process_invitation_reminders: %', SQLERRM;
    RETURN 0;
END;
$$;

COMMENT ON FUNCTION public.process_invitation_reminders() IS 'Processes invitation reminder emails. Marks completed users reminders as sent, then calls the Edge Function to send emails for pending reminders. Runs every 30 minutes via cron.';

-- ============================================================================
-- Cron Job: run every hour at :30
-- ============================================================================

-- Ensure job is not duplicated if migration is re-applied
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'process-invitation-reminders';

SELECT cron.schedule(
  'process-invitation-reminders',
  '30 * * * *',
  $$SELECT public.process_invitation_reminders()$$
);
