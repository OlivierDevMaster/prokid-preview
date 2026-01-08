-- Migration: add_email_notification_triggers
-- Purpose: Update notification broadcast trigger to send email notifications via Edge Function
-- Affected functions: notifications_broadcast_trigger
-- Dependencies: Requires pg_net extension, notifications table, and send-notification-email Edge Function

-- ============================================================================
-- Function: notifications_broadcast_trigger (Updated)
-- ============================================================================

-- Broadcast notification changes to user-specific channels and trigger email sending
-- Topic format: user:{recipient_id}:notifications
CREATE OR REPLACE FUNCTION "public"."notifications_broadcast_trigger"()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  supabase_url TEXT;
  supabase_service_role_key TEXT;
  api_url TEXT;
  request_body JSONB;
BEGIN
  -- Broadcast to Realtime (existing functionality)
  -- Wrap in exception handling to prevent Realtime errors from blocking email sending
  BEGIN
    PERFORM realtime.broadcast_changes(
      'user:' || COALESCE(NEW."recipient_id", OLD."recipient_id")::text || ':notifications',
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but continue execution
      RAISE WARNING 'Error broadcasting to Realtime: %', SQLERRM;
  END;

  -- Only send email for INSERT operations (new notifications)
  IF TG_OP = 'INSERT' AND NEW.id IS NOT NULL THEN
    -- Get Supabase URL and service role key from vault
    supabase_url := public.get_vault_secret('supabase_url');
    supabase_service_role_key := public.get_vault_secret('supabase_service_role_key');

    IF supabase_url IS NOT NULL THEN
      api_url := supabase_url || '/functions/v1/send-notification-email';
    ELSE
      RAISE WARNING 'supabase_url from vault is not set, fallback to localhost';
      api_url := 'http://127.0.0.1:54321/functions/v1/send-notification-email';
    END IF;

    IF supabase_service_role_key IS NULL THEN
      RAISE WARNING 'supabase_service_role_key from vault is not set';
    END IF;

    -- Prepare request body
    request_body := jsonb_build_object(
      'notification_id', NEW."id"
    );

    -- Call Edge Function using pg_net (fire-and-forget)
    -- The Edge Function will handle email sending, so we don't need to wait for response
    -- Wrap in exception handling to prevent HTTP errors from blocking notification creation
    BEGIN
      PERFORM net.http_post(
        api_url,
        request_body,
        '{}'::jsonb,
        jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || COALESCE(supabase_service_role_key, ''),
          'apikey', COALESCE(supabase_service_role_key, '')
        ),
        5000
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error but continue execution
        RAISE WARNING 'Error calling send-notification-email Edge Function: %', SQLERRM;
    END;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION "public"."notifications_broadcast_trigger"() IS 'Broadcasts notification changes to user-specific realtime channels and triggers email notification sending via Edge Function';

