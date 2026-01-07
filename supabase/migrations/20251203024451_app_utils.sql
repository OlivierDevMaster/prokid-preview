-- Migration: app_utils
-- Purpose: Create utility functions for application operations
-- Affected objects: update_updated_at_column function, is_admin function, extract_rrule_dates function, get_vault_secret function, get_rrule_day function


-- Helper function to get secret from vault
CREATE OR REPLACE FUNCTION public.get_vault_secret(secret_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    secret_value TEXT;
BEGIN
    SELECT decrypted_secret INTO secret_value
    FROM vault.decrypted_secrets
    WHERE name = secret_name
    LIMIT 1;

    RETURN secret_value;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.get_vault_secret(secret_name TEXT) IS 'Gets a secret from the vault';


-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Function to check if current user is admin
-- Uses SECURITY DEFINER to bypass RLS when checking admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = (SELECT auth.uid())
    AND role = 'admin'
  );
END;
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Checks if the current user is an admin. Uses SECURITY DEFINER to bypass RLS.';

-- Helper function to get RRULE day abbreviation from day offset
CREATE OR REPLACE FUNCTION public.get_rrule_day(day_offset INTEGER) RETURNS TEXT AS $$
  SELECT CASE EXTRACT(DOW FROM CURRENT_DATE + (day_offset::TEXT || ' days')::INTERVAL)
    WHEN 0 THEN 'SU'
    WHEN 1 THEN 'MO'
    WHEN 2 THEN 'TU'
    WHEN 3 THEN 'WE'
    WHEN 4 THEN 'TH'
    WHEN 5 THEN 'FR'
    WHEN 6 THEN 'SA'
  END;
$$ LANGUAGE SQL STABLE SET search_path = '';

COMMENT ON FUNCTION public.get_rrule_day(INTEGER) IS 'Returns the RRULE day abbreviation (SU, MO, TU, WE, TH, FR, SA) for a given day offset from today.';

-- Function to extract DTSTART and UNTIL from RRULE string
-- Calls the extract-rrule-dates Edge Function to parse RRULE using rrule library
-- The Edge Function updates the record directly, so we don't need to wait for the response
CREATE OR REPLACE FUNCTION "public"."extract_rrule_dates"()
RETURNS TRIGGER AS $$
DECLARE
  table_name TEXT;
  record_id UUID;
  supabase_url TEXT;
  supabase_service_role_key TEXT;
  api_url TEXT;
  request_body JSONB;
BEGIN
  -- Determine table name from trigger
  IF TG_TABLE_NAME = 'mission_schedules' THEN
    table_name := 'mission_schedules';
  ELSIF TG_TABLE_NAME = 'availabilities' THEN
    table_name := 'availabilities';
  ELSE
    RAISE EXCEPTION 'Unsupported table: %', TG_TABLE_NAME;
  END IF;

  -- Get record ID
  record_id := NEW.id;

    supabase_url := public.get_vault_secret('supabase_url');
    supabase_service_role_key := public.get_vault_secret('supabase_service_role_key');

    IF supabase_url IS NOT NULL THEN
        api_url := supabase_url || '/functions/v1/extract-rrule-dates';
    ELSE
        RAISE WARNING 'supabase_url from vault is not set, fallback to localhost';
        api_url := 'http://127.0.0.1:54321/functions/v1/extract-rrule-dates';
    END IF;

    IF supabase_service_role_key IS NULL THEN
        RAISE WARNING 'supabase_service_role_key from vault is not set';
    END IF;


  -- Prepare request body
    request_body := jsonb_build_object(
        'record_id', record_id,
        'table_name', table_name
    );

  -- Call Edge Function using pg_net (fire-and-forget)
  -- The Edge Function will update the record directly, so we don't need to wait for response
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

  -- Set dates to NULL initially - Edge Function will update them
  NEW.dtstart := NULL;
  NEW.until := NULL;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, log error and set dates to NULL
    RAISE WARNING 'Error in extract_rrule_dates trigger: %', SQLERRM;
    NEW.dtstart := NULL;
    NEW.until := NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."extract_rrule_dates"() IS 'Calls extract-rrule-dates Edge Function to extract DTSTART and UNTIL from RRULE string using rrule library. The Edge Function updates the record directly, so this trigger fires the request asynchronously.';

-- Drop deprecated availability creation functions (replaced by RRule library in application code)
-- These functions had timezone issues and are no longer used
DROP FUNCTION IF EXISTS public.create_recurring_availability(UUID, INTEGER, INTEGER, INTEGER, INTEGER[]);
DROP FUNCTION IF EXISTS public.create_onetime_availability(UUID, INTEGER, INTEGER, INTEGER);

