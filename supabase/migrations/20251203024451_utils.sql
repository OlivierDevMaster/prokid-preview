-- Migration: utils
-- Purpose: Create utility functions for database operations
-- Affected objects: update_updated_at_column function, seeds_get_rrule_day function, seeds_format_exdate function, seeds_get_next_weekday function, extract_rrule_dates function

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

CREATE OR REPLACE FUNCTION public.seeds_get_rrule_day(day_offset INTEGER) RETURNS TEXT AS $$
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

-- Helper function to get date string for EXDATE (simplifies formatting)
CREATE OR REPLACE FUNCTION public.seeds_format_exdate(date_offset INTEGER) RETURNS TEXT AS $$
BEGIN
  RETURN TO_CHAR(CURRENT_DATE + (date_offset::TEXT || ' days')::INTERVAL, 'YYYYMMDD') || 'T' ||
         TO_CHAR(CURRENT_DATE + (date_offset::TEXT || ' days')::INTERVAL, 'HH24MI') || '00Z';
END;
$$ LANGUAGE plpgsql STABLE SET search_path = '';

-- Function to create recurring availability with optional EXDATE
CREATE OR REPLACE FUNCTION public.seeds_create_recurring_availability(
  user_id_param UUID,
  day_offset INTEGER,
  hour INTEGER,
  duration_minutes INTEGER,
  exdate_offsets INTEGER[] DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  dtstart_text TEXT;
  rrule_text TEXT;
  exdate_text TEXT := '';
  i INTEGER;
  exdate_date DATE;
  final_rrule TEXT;
  target_dow INTEGER;
  base_date DATE;
BEGIN
  -- Build DTSTART (newline-separated format)
  dtstart_text := 'DTSTART:' ||
                  TO_CHAR(CURRENT_DATE + (day_offset::TEXT || ' days')::INTERVAL, 'YYYYMMDD') ||
                  'T' || LPAD(hour::TEXT, 2, '0') || '0000Z';

  -- Build RRULE (newline-separated format)
  rrule_text := E'\nRRULE:BYDAY=' || public.seeds_get_rrule_day(day_offset) || ';FREQ=WEEKLY';

  -- Get the target day of week (0=Sunday, 1=Monday, etc.)
  base_date := CURRENT_DATE + (day_offset::TEXT || ' days')::INTERVAL;
  target_dow := EXTRACT(DOW FROM base_date);

  -- Add EXDATE if provided (newline-separated format)
  IF exdate_offsets IS NOT NULL AND array_length(exdate_offsets, 1) > 0 THEN
    exdate_text := E'\nEXDATE:';
    FOR i IN 1..array_length(exdate_offsets, 1) LOOP
      IF i > 1 THEN
        exdate_text := exdate_text || ',';
      END IF;
      -- Start from the offset date
      exdate_date := CURRENT_DATE + (exdate_offsets[i]::TEXT || ' days')::INTERVAL;
      -- Find the next occurrence of the target day of week
      WHILE EXTRACT(DOW FROM exdate_date) != target_dow LOOP
        exdate_date := exdate_date + INTERVAL '1 day';
      END LOOP;
      exdate_text := exdate_text ||
                    TO_CHAR(exdate_date, 'YYYYMMDD') ||
                    'T' || LPAD(hour::TEXT, 2, '0') || '0000Z';
    END LOOP;
  END IF;

  -- Combine all parts (newline-separated format)
  final_rrule := dtstart_text || rrule_text || exdate_text;

  -- Insert the availability
  INSERT INTO public.availabilities (rrule, duration_mn, user_id)
  VALUES (final_rrule, duration_minutes, user_id_param);

  RETURN 'Created availability for user ' || user_id_param;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function to create one-time availability
CREATE OR REPLACE FUNCTION public.seeds_create_onetime_availability(
  user_id_param UUID,
  day_offset INTEGER,
  hour INTEGER,
  duration_minutes INTEGER
) RETURNS TEXT AS $$
DECLARE
  rrule_text TEXT;
BEGIN
  -- Build RRULE for one-time event (newline-separated format)
  rrule_text := 'DTSTART:' ||
                TO_CHAR(CURRENT_DATE + (day_offset::TEXT || ' days')::INTERVAL, 'YYYYMMDD') ||
                'T' || LPAD(hour::TEXT, 2, '0') || '0000Z' ||
                E'\nRRULE:COUNT=1;FREQ=DAILY';

  INSERT INTO public.availabilities (rrule, duration_mn, user_id)
  VALUES (rrule_text, duration_minutes, user_id_param);

  RETURN 'Created one-time availability for user ' || user_id_param;
END;
$$ LANGUAGE plpgsql SET search_path = '';

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

-- Function to get next occurrence of a day of week
CREATE OR REPLACE FUNCTION public.seeds_get_next_weekday(target_dow INTEGER, days_ahead INTEGER DEFAULT 0)
RETURNS DATE AS $$
DECLARE
  current_dow INTEGER;
  days_to_add INTEGER;
  result_date DATE;
BEGIN
  current_dow := EXTRACT(DOW FROM CURRENT_DATE + (days_ahead || ' days')::INTERVAL);
  days_to_add := (target_dow - current_dow + 7) % 7;
  IF days_to_add = 0 AND days_ahead = 0 THEN
    days_to_add := 7; -- If today is the target day and days_ahead is 0, get next week
  ELSIF days_to_add = 0 THEN
    days_to_add := 0; -- If we're already on the target day with days_ahead > 0, use that day
  END IF;
  result_date := CURRENT_DATE + (days_ahead + days_to_add || ' days')::INTERVAL;
  RETURN result_date;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = '';

COMMENT ON FUNCTION public.seeds_get_next_weekday(INTEGER, INTEGER) IS 'Returns the next occurrence of a specified day of week (0=Sunday, 1=Monday, etc.). days_ahead parameter allows getting occurrences in future weeks.';

-- Function to create mission RRULE (recurring or one-time)
CREATE OR REPLACE FUNCTION public.seeds_create_mission_rrule(
  day_offset INTEGER,
  hour INTEGER,
  duration_minutes INTEGER,
  weeks_ahead INTEGER DEFAULT 0,
  until_offset INTEGER DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  dtstart_text TEXT;
  rrule_text TEXT;
  until_text TEXT := '';
  target_date DATE;
  until_date DATE;
BEGIN
  -- Calculate target date
  target_date := public.seeds_get_next_weekday(
    EXTRACT(DOW FROM CURRENT_DATE + (day_offset::TEXT || ' days')::INTERVAL)::INTEGER,
    weeks_ahead * 7
  );

  -- Build DTSTART (newline-separated format)
  dtstart_text := 'DTSTART:' ||
                  TO_CHAR(target_date, 'YYYYMMDD') ||
                  'T' || LPAD(hour::TEXT, 2, '0') || '0000Z';

  -- Build RRULE (newline-separated format)
  -- For one-time missions, use COUNT=1; for recurring, use weekly pattern
  IF until_offset IS NULL THEN
    -- One-time mission
    rrule_text := E'\nRRULE:COUNT=1;FREQ=DAILY';
  ELSE
    -- Recurring mission
    rrule_text := E'\nRRULE:BYDAY=' || public.seeds_get_rrule_day(day_offset) || ';FREQ=WEEKLY';

    -- Add UNTIL if specified
    until_date := target_date + (until_offset::TEXT || ' days')::INTERVAL;
    until_text := E'\nUNTIL:' ||
                  TO_CHAR(until_date, 'YYYYMMDD') ||
                  'T' || LPAD(hour::TEXT, 2, '0') || '0000Z';
  END IF;

  -- Combine all parts (newline-separated format)
  RETURN dtstart_text || rrule_text || until_text;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = '';

COMMENT ON FUNCTION public.seeds_create_mission_rrule(INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) IS 'Creates RRULE string for missions. If until_offset is NULL, creates one-time mission. Otherwise creates recurring mission with UNTIL date.';

-- Function to extract DTSTART and UNTIL from RRULE string
CREATE OR REPLACE FUNCTION "public"."extract_rrule_dates"()
RETURNS TRIGGER AS $$
DECLARE
  rrule_lines TEXT[];
  line TEXT;
  dtstart_str TEXT;
  until_str TEXT;
  dtstart_ts TIMESTAMP WITH TIME ZONE;
  until_ts TIMESTAMP WITH TIME ZONE;
  year_val INTEGER;
  month_val INTEGER;
  day_val INTEGER;
  hour_val INTEGER;
  minute_val INTEGER;
  second_val INTEGER;
BEGIN
  -- Split RRULE by newlines
  rrule_lines := string_to_array(NEW."rrule", E'\n');

  -- Initialize
  dtstart_str := NULL;
  until_str := NULL;

  -- Parse each line
  FOREACH line IN ARRAY rrule_lines
  LOOP
    -- Extract DTSTART (only first occurrence)
    IF dtstart_str IS NULL AND line ~* '^DTSTART:' THEN
      dtstart_str := substring(line from '^DTSTART:(.+)$');
    END IF;

    -- Extract UNTIL (only first occurrence)
    IF until_str IS NULL AND line ~* '^UNTIL:' THEN
      until_str := substring(line from '^UNTIL:(.+)$');
    END IF;
  END LOOP;

  -- Convert DTSTART to timestamp
  IF dtstart_str IS NOT NULL THEN
    -- Format: YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
    -- Both formats are in UTC per RRULE specification
    BEGIN
      -- Extract date components directly using regex capturing groups
      -- Check if the string matches the pattern first
      IF dtstart_str ~ '^\d{4}\d{2}\d{2}T\d{2}\d{2}\d{2}' THEN
        year_val := substring(dtstart_str from '^(\d{4})')::integer;
        month_val := substring(dtstart_str from '^\d{4}(\d{2})')::integer;
        day_val := substring(dtstart_str from '^\d{6}(\d{2})')::integer;
        hour_val := substring(dtstart_str from '^\d{8}T(\d{2})')::integer;
        minute_val := substring(dtstart_str from '^\d{8}T\d{2}(\d{2})')::integer;
        second_val := substring(dtstart_str from '^\d{8}T\d{4}(\d{2})')::integer;

        -- Create timestamp explicitly in UTC
        dtstart_ts := make_timestamptz(year_val, month_val, day_val, hour_val, minute_val, second_val, 'UTC');
        NEW."dtstart" := dtstart_ts;
      ELSE
        NEW."dtstart" := NULL;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- If parsing fails, leave dtstart as NULL
        NEW."dtstart" := NULL;
    END;
  ELSE
    NEW."dtstart" := NULL;
  END IF;

  -- Convert UNTIL to timestamp (can be NULL for long-term recurring events)
  IF until_str IS NOT NULL THEN
    -- Format: YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
    -- Both formats are in UTC per RRULE specification
    BEGIN
      -- Extract date components directly using regex capturing groups
      -- Check if the string matches the pattern first
      IF until_str ~ '^\d{4}\d{2}\d{2}T\d{2}\d{2}\d{2}' THEN
        year_val := substring(until_str from '^(\d{4})')::integer;
        month_val := substring(until_str from '^\d{4}(\d{2})')::integer;
        day_val := substring(until_str from '^\d{6}(\d{2})')::integer;
        hour_val := substring(until_str from '^\d{8}T(\d{2})')::integer;
        minute_val := substring(until_str from '^\d{8}T\d{2}(\d{2})')::integer;
        second_val := substring(until_str from '^\d{8}T\d{4}(\d{2})')::integer;

        -- Create timestamp explicitly in UTC
        until_ts := make_timestamptz(year_val, month_val, day_val, hour_val, minute_val, second_val, 'UTC');
        NEW."until" := until_ts;
      ELSE
        NEW."until" := NULL;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- If parsing fails, leave until as NULL
        NEW."until" := NULL;
    END;
  ELSE
    NEW."until" := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."extract_rrule_dates"() IS 'Extracts DTSTART and UNTIL timestamps from RRULE string and populates dtstart and until columns';

-- Function to create mission with schedule from availability (for seeding)
-- Finds matching availability and creates mission with generated schedule
CREATE OR REPLACE FUNCTION public.seeds_create_mission_from_availability(
  structure_id_param UUID,
  professional_id_param UUID,
  day_offset INTEGER,
  hour INTEGER,
  duration_minutes INTEGER,
  weeks_ahead INTEGER DEFAULT 0,
  until_offset INTEGER DEFAULT NULL,
  status_param TEXT DEFAULT 'pending',
  title_param TEXT DEFAULT 'Mission',
  description_param TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  target_date DATE;
  mission_dtstart_ts TIMESTAMP WITH TIME ZONE;
  mission_until_ts TIMESTAMP WITH TIME ZONE;
  target_dow INTEGER;
  availability_record RECORD;
  mission_id_result UUID;
  generated_rrule TEXT;
  availability_dtstart_str TEXT;
  availability_rrule_str TEXT;
  availability_until_str TEXT;
  exdate_lines TEXT[];
  rrule_lines TEXT[];
  line TEXT;
  hour_val INTEGER;
  minute_val INTEGER;
BEGIN
  -- Calculate target date
  target_date := public.seeds_get_next_weekday(
    EXTRACT(DOW FROM CURRENT_DATE + (day_offset::TEXT || ' days')::INTERVAL)::INTEGER,
    weeks_ahead * 7
  );

  -- Set mission dates
  mission_dtstart_ts := target_date::TIMESTAMP WITH TIME ZONE + (hour::TEXT || ' hours')::INTERVAL;

  IF until_offset IS NULL THEN
    -- One-time mission: end same day
    mission_until_ts := target_date::TIMESTAMP WITH TIME ZONE + (hour::TEXT || ' hours')::INTERVAL + (duration_minutes::TEXT || ' minutes')::INTERVAL;
  ELSE
    -- Recurring mission: calculate until date
    mission_until_ts := (target_date + (until_offset::TEXT || ' days')::INTERVAL)::TIMESTAMP WITH TIME ZONE + (hour::TEXT || ' hours')::INTERVAL;
  END IF;

  -- Find matching availability
  target_dow := EXTRACT(DOW FROM target_date)::INTEGER;

  SELECT id, rrule, duration_mn INTO availability_record
  FROM public.availabilities
  WHERE user_id = professional_id_param
    AND duration_mn = duration_minutes
    AND rrule ~* ('BYDAY=' || public.seeds_get_rrule_day(day_offset))
    AND rrule ~* ('T' || LPAD(hour::TEXT, 2, '0'))
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No matching availability found for professional %, day_offset %, hour %, duration %',
      professional_id_param, day_offset, hour, duration_minutes;
  END IF;

  -- Parse availability RRULE to extract pattern and time
  rrule_lines := string_to_array(availability_record.rrule, E'\n');
  availability_dtstart_str := NULL;
  availability_rrule_str := NULL;
  availability_until_str := NULL;
  exdate_lines := ARRAY[]::TEXT[];

  FOREACH line IN ARRAY rrule_lines
  LOOP
    IF line ~* '^DTSTART:' THEN
      availability_dtstart_str := substring(line from '^DTSTART:(.+)$');
      -- Extract hour and minute
      hour_val := substring(availability_dtstart_str from 'T(\d{2})\d{4}')::INTEGER;
      minute_val := substring(availability_dtstart_str from 'T\d{2}(\d{2})\d{2}')::INTEGER;
    ELSIF line ~* '^RRULE:' THEN
      availability_rrule_str := substring(line from '^RRULE:(.+)$');
    ELSIF line ~* '^UNTIL:' THEN
      availability_until_str := substring(line from '^UNTIL:(.+)$');
    ELSIF line ~* '^EXDATE:' THEN
      exdate_lines := array_append(exdate_lines, line);
    END IF;
  END LOOP;

  -- Generate mission schedule RRULE
  -- DTSTART: mission_dtstart with availability time
  generated_rrule := 'DTSTART:' ||
    TO_CHAR(mission_dtstart_ts, 'YYYYMMDD') ||
    'T' || LPAD(hour_val::TEXT, 2, '0') ||
    LPAD(minute_val::TEXT, 2, '0') || '00Z';

  -- Add RRULE pattern
  IF availability_rrule_str IS NOT NULL THEN
    generated_rrule := generated_rrule || E'\nRRULE:' || availability_rrule_str;
  END IF;

  -- Add UNTIL
  generated_rrule := generated_rrule || E'\nUNTIL:' ||
    TO_CHAR(mission_until_ts, 'YYYYMMDD') ||
    'T' || LPAD(hour_val::TEXT, 2, '0') ||
    LPAD(minute_val::TEXT, 2, '0') || '00Z';

  -- Add EXDATE if present
  IF array_length(exdate_lines, 1) > 0 THEN
    generated_rrule := generated_rrule || E'\n' || array_to_string(exdate_lines, E'\n');
  END IF;

  -- Create mission
  INSERT INTO public.missions (
    structure_id,
    professional_id,
    title,
    description,
    status,
    mission_dtstart,
    mission_until
  ) VALUES (
    structure_id_param,
    professional_id_param,
    title_param,
    description_param,
    status_param::mission_status,
    mission_dtstart_ts,
    mission_until_ts
  )
  RETURNING id INTO mission_id_result;

  -- Create mission schedule
  INSERT INTO public.mission_schedules (
    mission_id,
    availability_id,
    rrule,
    duration_mn
  ) VALUES (
    mission_id_result,
    availability_record.id,
    generated_rrule,
    availability_record.duration_mn
  );

  RETURN mission_id_result;
END;
$$ LANGUAGE plpgsql SET search_path = '';

COMMENT ON FUNCTION public.seeds_create_mission_from_availability(UUID, UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT) IS 'Creates a mission with schedule from matching availability. Used for seeding. Finds availability by day/hour/duration and generates schedule RRULE with mission date constraints.';
