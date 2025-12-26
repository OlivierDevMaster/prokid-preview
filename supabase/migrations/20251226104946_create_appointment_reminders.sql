-- Migration: create_appointment_reminders
-- Purpose: Create appointment_reminders table and related functions for sending email reminders 24h before mission schedule occurrences
-- Affected tables: appointment_reminders
-- Dependencies: Requires missions, mission_schedules, professionals, profiles tables to exist

-- ============================================================================
-- Model: appointment_reminders
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."appointment_reminders" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "mission_id" UUID NOT NULL REFERENCES "public"."missions"("id") ON DELETE CASCADE,
  "mission_schedule_id" UUID NOT NULL REFERENCES "public"."mission_schedules"("id") ON DELETE CASCADE,
  "occurrence_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "sent_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "appointment_reminders_unique_occurrence" UNIQUE ("mission_schedule_id", "occurrence_date")
);

-- Comments
COMMENT ON TABLE "public"."appointment_reminders" IS 'Tracks appointment reminders sent to professionals 24 hours before mission schedule occurrences';
COMMENT ON COLUMN "public"."appointment_reminders"."mission_id" IS 'Reference to the mission';
COMMENT ON COLUMN "public"."appointment_reminders"."mission_schedule_id" IS 'Reference to the mission schedule';
COMMENT ON COLUMN "public"."appointment_reminders"."occurrence_date" IS 'The specific appointment date/time for which the reminder was sent';
COMMENT ON COLUMN "public"."appointment_reminders"."sent_at" IS 'Timestamp when the reminder email was successfully sent';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_appointment_reminders_mission_id" ON "public"."appointment_reminders" ("mission_id");
CREATE INDEX IF NOT EXISTS "idx_appointment_reminders_mission_schedule_id" ON "public"."appointment_reminders" ("mission_schedule_id");
CREATE INDEX IF NOT EXISTS "idx_appointment_reminders_occurrence_date" ON "public"."appointment_reminders" ("occurrence_date");
CREATE INDEX IF NOT EXISTS "idx_appointment_reminders_sent_at" ON "public"."appointment_reminders" ("sent_at");

-- RLS
ALTER TABLE "public"."appointment_reminders" ENABLE ROW LEVEL SECURITY;

-- Professionals can view reminders for their missions
CREATE POLICY "Professionals can view reminders for their missions" ON "public"."appointment_reminders"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."missions"
      WHERE "missions"."id" = "appointment_reminders"."mission_id"
      AND "missions"."professional_id" = (SELECT auth.uid())
    )
  );

-- Admins can view all reminders
CREATE POLICY "Admins can view all reminders" ON "public"."appointment_reminders"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Only system (via Edge Function with service role) can insert reminders
-- This is handled by service role key, so we don't need a policy for INSERT
-- But we'll create one that allows service role inserts
CREATE POLICY "Service role can insert reminders" ON "public"."appointment_reminders"
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- Admins can insert reminders
CREATE POLICY "Admins can insert reminders" ON "public"."appointment_reminders"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can update reminders
CREATE POLICY "Admins can update reminders" ON "public"."appointment_reminders"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete reminders
CREATE POLICY "Admins can delete reminders" ON "public"."appointment_reminders"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- Function: send_appointment_reminders
-- ============================================================================

-- Function to identify appointments needing reminders and call Edge Function
-- This function queries accepted missions and their schedules, then calls
-- the Edge Function which will handle RRULE expansion and email sending
CREATE OR REPLACE FUNCTION public.send_appointment_reminders()
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
  missions_data JSONB;
  reminders_count INTEGER := 0;
BEGIN
  -- Get Supabase URL and service role key from vault
  supabase_url := public.get_vault_secret('supabase_url');
  supabase_service_role_key := public.get_vault_secret('supabase_service_role_key');

  IF supabase_url IS NULL THEN
    RAISE WARNING 'supabase_url from vault is not set, fallback to localhost';
    api_url := 'http://127.0.0.1:54321/functions/v1/appointment-reminders';
  ELSE
    api_url := supabase_url || '/functions/v1/appointment-reminders';
  END IF;

  IF supabase_service_role_key IS NULL THEN
    RAISE WARNING 'supabase_service_role_key from vault is not set';
    RETURN 0;
  END IF;

  -- Query accepted missions with their schedules
  -- We'll send all accepted missions to the Edge Function, which will:
  -- 1. Expand RRULEs to get occurrences
  -- 2. Filter occurrences that are 24h away (23-25h window)
  -- 3. Check if reminders already sent
  -- 4. Send emails and record reminders
  SELECT jsonb_agg(
    jsonb_build_object(
      'mission_id', m.id,
      'mission_dtstart', m.mission_dtstart,
      'mission_until', m.mission_until,
      'schedules', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'schedule_id', ms.id,
            'rrule', ms.rrule,
            'duration_mn', ms.duration_mn
          )
        )
        FROM public.mission_schedules ms
        WHERE ms.mission_id = m.id
      )
    )
  )
  INTO missions_data
  FROM public.missions m
  WHERE m.status = 'accepted'
    AND m.mission_until > NOW()
    AND EXISTS (
      SELECT 1 FROM public.mission_schedules ms
      WHERE ms.mission_id = m.id
    );

  -- If no missions found, return 0
  IF missions_data IS NULL OR jsonb_array_length(missions_data) = 0 THEN
    RETURN 0;
  END IF;

  -- Prepare request body
  request_body := jsonb_build_object(
    'missions', missions_data
  );

  -- Call Edge Function using pg_net (fire-and-forget)
  -- The Edge Function will process reminders and update the appointment_reminders table
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

  -- Return approximate count (we don't wait for response)
  SELECT jsonb_array_length(missions_data) INTO reminders_count;
  RETURN reminders_count;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Error in send_appointment_reminders: %', SQLERRM;
    RETURN 0;
END;
$$;

COMMENT ON FUNCTION public.send_appointment_reminders() IS 'Identifies accepted missions that need appointment reminders and calls the appointment-reminders Edge Function to process and send them. Returns the number of missions queued for processing.';

-- ============================================================================
-- Schedule: Hourly reminder check
-- ============================================================================

-- Schedule the function to run every hour at minute 0
-- Pattern: '0 * * * *' means: minute 0 of every hour, every day
SELECT cron.schedule(
  'send-appointment-reminders',
  '0 * * * *',
  $$SELECT public.send_appointment_reminders()$$
);

