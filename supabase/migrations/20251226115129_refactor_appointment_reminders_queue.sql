-- Migration: refactor_appointment_reminders_queue
-- Purpose: Refactor appointment reminders to use queue-based architecture with RRULE expansion in Edge Functions only
-- Affected tables: appointment_reminders_pending (new), appointment_reminders (unchanged)
-- Dependencies: Requires missions, mission_schedules tables to exist

-- ============================================================================
-- Model: appointment_reminders_pending
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."appointment_reminders_pending" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "mission_id" UUID NOT NULL REFERENCES "public"."missions"("id") ON DELETE CASCADE,
  "mission_schedule_id" UUID NOT NULL REFERENCES "public"."mission_schedules"("id") ON DELETE CASCADE,
  "occurrence_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "attempts" INTEGER DEFAULT 0 NOT NULL,
  "last_attempt_at" TIMESTAMP WITH TIME ZONE,
  "next_retry_at" TIMESTAMP WITH TIME ZONE,
  "error_message" TEXT,
  "reminder_type" TEXT DEFAULT 'email' NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "processed_at" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "appointment_reminders_pending_status_check" CHECK ("status" IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  CONSTRAINT "appointment_reminders_pending_reminder_type_check" CHECK ("reminder_type" IN ('email', 'sms', 'push')),
  CONSTRAINT "appointment_reminders_pending_attempts_check" CHECK ("attempts" >= 0),
  CONSTRAINT "appointment_reminders_pending_unique_occurrence" UNIQUE ("mission_schedule_id", "occurrence_date", "reminder_type")
);

-- Comments
COMMENT ON TABLE "public"."appointment_reminders_pending" IS 'Queue table for appointment reminders waiting to be processed. RRULE expansion happens in Edge Functions, and results are stored here for processing.';
COMMENT ON COLUMN "public"."appointment_reminders_pending"."mission_id" IS 'Reference to the mission';
COMMENT ON COLUMN "public"."appointment_reminders_pending"."mission_schedule_id" IS 'Reference to the mission schedule';
COMMENT ON COLUMN "public"."appointment_reminders_pending"."occurrence_date" IS 'The specific appointment date/time for which the reminder should be sent';
COMMENT ON COLUMN "public"."appointment_reminders_pending"."status" IS 'Queue status: pending, processing, sent, failed, or cancelled';
COMMENT ON COLUMN "public"."appointment_reminders_pending"."attempts" IS 'Number of processing attempts made';
COMMENT ON COLUMN "public"."appointment_reminders_pending"."last_attempt_at" IS 'Timestamp of the last processing attempt';
COMMENT ON COLUMN "public"."appointment_reminders_pending"."next_retry_at" IS 'Timestamp when the reminder should be retried (for failed reminders)';
COMMENT ON COLUMN "public"."appointment_reminders_pending"."error_message" IS 'Error message from the last failed attempt';
COMMENT ON COLUMN "public"."appointment_reminders_pending"."reminder_type" IS 'Type of reminder: email, sms, or push (for future use)';
COMMENT ON COLUMN "public"."appointment_reminders_pending"."processed_at" IS 'Timestamp when the reminder was successfully processed';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_appointment_reminders_pending_mission_id" ON "public"."appointment_reminders_pending" ("mission_id");
CREATE INDEX IF NOT EXISTS "idx_appointment_reminders_pending_mission_schedule_id" ON "public"."appointment_reminders_pending" ("mission_schedule_id");
CREATE INDEX IF NOT EXISTS "idx_appointment_reminders_pending_occurrence_date" ON "public"."appointment_reminders_pending" ("occurrence_date");
CREATE INDEX IF NOT EXISTS "idx_appointment_reminders_pending_status_next_retry" ON "public"."appointment_reminders_pending" ("status", "next_retry_at") WHERE "status" IN ('pending', 'failed');
CREATE INDEX IF NOT EXISTS "idx_appointment_reminders_pending_status" ON "public"."appointment_reminders_pending" ("status");

-- RLS
ALTER TABLE "public"."appointment_reminders_pending" ENABLE ROW LEVEL SECURITY;

-- Professionals can view pending reminders for their missions
CREATE POLICY "Professionals can view pending reminders for their missions" ON "public"."appointment_reminders_pending"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."missions"
      WHERE "missions"."id" = "appointment_reminders_pending"."mission_id"
      AND "missions"."professional_id" = (SELECT auth.uid())
    )
  );

-- Admins can view all pending reminders
CREATE POLICY "Admins can view all pending reminders" ON "public"."appointment_reminders_pending"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Service role can insert pending reminders (from Edge Function)
CREATE POLICY "Service role can insert pending reminders" ON "public"."appointment_reminders_pending"
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- Service role can update pending reminders (from Edge Function)
CREATE POLICY "Service role can update pending reminders" ON "public"."appointment_reminders_pending"
  FOR UPDATE
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Admins can manage pending reminders
CREATE POLICY "Admins can manage pending reminders" ON "public"."appointment_reminders_pending"
  FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- ============================================================================
-- Function: cleanup_ended_mission_reminders
-- ============================================================================

-- Function to clean up pending reminders for ended/cancelled/declined/expired missions
CREATE OR REPLACE FUNCTION public.cleanup_ended_mission_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  -- Delete pending and processing reminders for ended/cancelled/declined/expired missions
  DELETE FROM public.appointment_reminders_pending
  WHERE status IN ('pending', 'processing')
    AND mission_id IN (
      SELECT id FROM public.missions
      WHERE status IN ('ended', 'cancelled', 'declined', 'expired')
    );

  GET DIAGNOSTICS cleaned_count = ROW_COUNT;

  RETURN cleaned_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_ended_mission_reminders() IS 'Cleans up pending and processing reminders for missions that have ended, been cancelled, declined, or expired. Returns the count of reminders cleaned up.';

-- ============================================================================
-- Function: queue_appointment_reminders
-- ============================================================================

-- Replace send_appointment_reminders() with queue_appointment_reminders()
-- This function queues missions for RRULE expansion (which happens in Edge Function)
-- Processes one mission at a time to avoid CPU time limits
CREATE OR REPLACE FUNCTION public.queue_appointment_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  supabase_url TEXT;
  supabase_service_role_key TEXT;
  api_url TEXT;
  request_body JSONB;
  mission_record RECORD;
  missions_count INTEGER := 0;
  processed_count INTEGER := 0;
BEGIN
  -- Get Supabase URL and service role key from vault
  supabase_url := public.get_vault_secret('supabase_url');
  supabase_service_role_key := public.get_vault_secret('supabase_service_role_key');

  IF supabase_url IS NULL THEN
    RAISE WARNING 'supabase_url from vault is not set, fallback to localhost';
    api_url := 'http://127.0.0.1:54321/functions/v1/expand-rrules';
  ELSE
    api_url := supabase_url || '/functions/v1/expand-rrules';
  END IF;

  IF supabase_service_role_key IS NULL THEN
    RAISE WARNING 'supabase_service_role_key from vault is not set';
    RETURN 0;
  END IF;

  -- Process each mission individually to avoid CPU time limits
  -- A mission can have multiple schedules, and each schedule can have many recurrences
  FOR mission_record IN
    SELECT
      m.id as mission_id,
      m.mission_dtstart,
      m.mission_until,
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'schedule_id', ms.id,
            'rrule', ms.rrule,
            'duration_mn', ms.duration_mn
          )
        )
        FROM public.mission_schedules ms
        WHERE ms.mission_id = m.id
      ) as schedules
    FROM public.missions m
    WHERE m.status = 'accepted'
      AND m.mission_until > NOW()
      AND EXISTS (
        SELECT 1 FROM public.mission_schedules ms
        WHERE ms.mission_id = m.id
      )
  LOOP
    -- Skip if no schedules
    IF mission_record.schedules IS NULL OR jsonb_array_length(mission_record.schedules) = 0 THEN
      CONTINUE;
    END IF;

    -- Prepare request body for single mission
    -- Format timestamps as ISO 8601 strings with Z suffix for UTC
    -- z.iso.datetime() requires Z format for UTC (doesn't accept +00:00)
    request_body := jsonb_build_object(
      'missions', jsonb_build_array(
        jsonb_build_object(
          'mission_id', mission_record.mission_id,
          'mission_dtstart', to_char(mission_record.mission_dtstart AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'mission_until', to_char(mission_record.mission_until AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'schedules', mission_record.schedules
        )
      )
    );

    -- Call Edge Function for this single mission (fire-and-forget)
    -- The Edge Function will expand RRULEs and populate appointment_reminders_pending
    BEGIN
      PERFORM net.http_post(
        api_url,
        request_body,
        '{}'::jsonb,
        jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || supabase_service_role_key,
          'apikey', supabase_service_role_key
        )
      );
      processed_count := processed_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error for this mission but continue with next
        RAISE WARNING 'Error processing mission %: %', mission_record.mission_id, SQLERRM;
    END;
  END LOOP;

  -- Return count of missions processed
  RETURN processed_count;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Error in queue_appointment_reminders: %', SQLERRM;
    RETURN processed_count;
END;
$$;

COMMENT ON FUNCTION public.queue_appointment_reminders() IS 'Queues accepted missions for RRULE expansion. Calls the expand-rrules Edge Function which expands RRULEs and populates the appointment_reminders_pending queue. Returns the number of missions queued. Dates are formatted as ISO 8601 with Z suffix for UTC compatibility with z.iso.datetime() validation.';

-- ============================================================================
-- Function: select_pending_reminders
-- ============================================================================

-- RPC function to select pending reminders with SELECT FOR UPDATE SKIP LOCKED
-- This allows concurrent processing while preventing duplicate work
-- Default batch size is 1 to process one reminder at a time and avoid CPU limits
CREATE OR REPLACE FUNCTION public.select_pending_reminders(batch_size_param INTEGER DEFAULT 1)
RETURNS TABLE (
  id UUID,
  mission_id UUID,
  mission_schedule_id UUID,
  occurrence_date TIMESTAMP WITH TIME ZONE,
  reminder_type TEXT,
  attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    arp.id,
    arp.mission_id,
    arp.mission_schedule_id,
    arp.occurrence_date,
    arp.reminder_type,
    arp.attempts
  FROM public.appointment_reminders_pending arp
  WHERE arp.status = 'pending'
    AND (arp.next_retry_at IS NULL OR arp.next_retry_at <= NOW())
  ORDER BY arp.occurrence_date
  LIMIT batch_size_param
  FOR UPDATE SKIP LOCKED;
END;
$$;

COMMENT ON FUNCTION public.select_pending_reminders(INTEGER) IS 'Selects pending reminders for processing using SELECT FOR UPDATE SKIP LOCKED to allow concurrent processing. Returns up to batch_size_param reminders.';

-- ============================================================================
-- Update Cron Jobs
-- ============================================================================

-- Remove old cron job
SELECT cron.unschedule('send-appointment-reminders');

-- Schedule queue function (hourly at :00)
SELECT cron.schedule(
  'queue-appointment-reminders',
  '0 * * * *',
  $$SELECT public.queue_appointment_reminders()$$
);

-- Schedule cleanup function (hourly at :05, after queue)
SELECT cron.schedule(
  'cleanup-ended-mission-reminders',
  '5 * * * *',
  $$SELECT public.cleanup_ended_mission_reminders()$$
);

-- Schedule process reminders function (every 10 minutes)
-- Note: This will call the process-reminders Edge Function
-- We'll need to create a database function wrapper for this
CREATE OR REPLACE FUNCTION public.process_appointment_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  supabase_url TEXT;
  supabase_service_role_key TEXT;
  api_url TEXT;
  request_body JSONB;
  reminder_record RECORD;
  processed_count INTEGER := 0;
BEGIN
  -- Get Supabase URL and service role key from vault
  supabase_url := public.get_vault_secret('supabase_url');
  supabase_service_role_key := public.get_vault_secret('supabase_service_role_key');

  IF supabase_url IS NULL THEN
    RAISE WARNING 'supabase_url from vault is not set, fallback to localhost';
    api_url := 'http://127.0.0.1:54321/functions/v1/process-reminders';
  ELSE
    api_url := supabase_url || '/functions/v1/process-reminders';
  END IF;

  IF supabase_service_role_key IS NULL THEN
    RAISE WARNING 'supabase_service_role_key from vault is not set';
    RETURN 0;
  END IF;

  -- Select up to 50 pending reminder IDs
  -- Process each reminder by calling Edge Function individually
  FOR reminder_record IN
    SELECT arp.id
    FROM public.appointment_reminders_pending arp
    WHERE arp.status = 'pending'
      AND (arp.next_retry_at IS NULL OR arp.next_retry_at <= NOW())
    ORDER BY arp.occurrence_date
    LIMIT 50
  LOOP
    -- Prepare request body with specific reminder ID
    request_body := jsonb_build_object(
      'reminder_id', reminder_record.id
    );

    -- Call Edge Function using pg_net (fire-and-forget)
    -- Each call processes one reminder
    BEGIN
      PERFORM net.http_post(
        api_url,
        request_body,
        '{}'::jsonb,
        jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || supabase_service_role_key,
          'apikey', supabase_service_role_key
        )
      );
      processed_count := processed_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error for this reminder but continue with next
        RAISE WARNING 'Error calling Edge Function for reminder %: %', reminder_record.id, SQLERRM;
    END;
  END LOOP;

  -- Return count of reminders processed
  RETURN processed_count;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Error in process_appointment_reminders: %', SQLERRM;
    RETURN processed_count;
END;
$$;

COMMENT ON FUNCTION public.process_appointment_reminders() IS 'Calls the process-reminders Edge Function to process the appointment_reminders_pending queue. Returns 1 on success, 0 on error.';

SELECT cron.schedule(
  'process-appointment-reminders',
  '*/10 * * * *',
  $$SELECT public.process_appointment_reminders()$$
);

