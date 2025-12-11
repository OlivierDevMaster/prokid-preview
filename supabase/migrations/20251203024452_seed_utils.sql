-- Migration: seed_utils
-- Purpose: Create utility functions for database seeding operations
-- Affected objects: seeds_get_rrule_day, seeds_format_exdate, seeds_get_next_weekday, seeds_create_mission_rrule, seeds_create_recurring_availability, seeds_create_onetime_availability, seeds_create_mission_from_availability, seeds_create_mission_with_custom_rrule

-- Helper function to get RRULE day abbreviation from day offset
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
    -- Recurring mission - UNTIL must be part of the RRULE line
    until_date := target_date + (until_offset::TEXT || ' days')::INTERVAL;
    rrule_text := E'\nRRULE:BYDAY=' || public.seeds_get_rrule_day(day_offset) || ';FREQ=WEEKLY;UNTIL=' ||
                  TO_CHAR(until_date, 'YYYYMMDD') ||
                  'T' || LPAD(hour::TEXT, 2, '0') || '0000Z';
  END IF;

  -- Combine all parts (newline-separated format)
  RETURN dtstart_text || rrule_text;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = '';

COMMENT ON FUNCTION public.seeds_create_mission_rrule(INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) IS 'Creates RRULE string for missions. If until_offset is NULL, creates one-time mission. Otherwise creates recurring mission with UNTIL date.';

-- Function to create mission with schedule (for seeding)
-- Optionally matches availabilities for realistic seed data, but allows any RRULE
-- This reflects the system: frontend suggests availabilities, but backend accepts any RRULE
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
  rrule_day TEXT;
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

  -- Try to find matching availability (optional - for realistic seed data)
  -- Allow partial availability slots: duration_mn >= duration_minutes
  -- Also allow missions that overlap or are outside availabilities
  target_dow := EXTRACT(DOW FROM target_date)::INTEGER;
  -- Calculate rrule_day from actual target_date, not from day_offset
  -- This ensures the RRULE matches the actual mission date
  rrule_day := CASE target_dow
    WHEN 0 THEN 'SU'
    WHEN 1 THEN 'MO'
    WHEN 2 THEN 'TU'
    WHEN 3 THEN 'WE'
    WHEN 4 THEN 'TH'
    WHEN 5 THEN 'FR'
    WHEN 6 THEN 'SA'
  END;

  SELECT id, rrule, duration_mn INTO availability_record
  FROM public.availabilities
  WHERE user_id = professional_id_param
    AND rrule ~* ('BYDAY=' || rrule_day)
    AND (
      -- Match exact hour
      rrule ~* ('T' || LPAD(hour::TEXT, 2, '0'))
      -- Or allow partial overlap (within 2 hours before/after)
      OR rrule ~* ('T' || LPAD((hour - 2)::TEXT, 2, '0'))
      OR rrule ~* ('T' || LPAD((hour - 1)::TEXT, 2, '0'))
      OR rrule ~* ('T' || LPAD((hour + 1)::TEXT, 2, '0'))
      OR rrule ~* ('T' || LPAD((hour + 2)::TEXT, 2, '0'))
    )
  ORDER BY
    -- Prefer exact hour match
    CASE WHEN rrule ~* ('T' || LPAD(hour::TEXT, 2, '0')) THEN 0 ELSE 1 END,
    -- Then prefer duration that matches or is close
    ABS(duration_mn - duration_minutes),
    duration_mn ASC
  LIMIT 1;

  -- If availability found, use its RRULE pattern; otherwise generate a simple weekly RRULE
  IF FOUND THEN
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

    -- Generate mission schedule RRULE using availability pattern
    -- DTSTART: mission_dtstart with requested hour (not necessarily availability hour)
    generated_rrule := 'DTSTART:' ||
      TO_CHAR(mission_dtstart_ts, 'YYYYMMDD') ||
      'T' || LPAD(hour::TEXT, 2, '0') ||
      '0000Z';

    -- Add RRULE pattern from availability, but override BYDAY to match target_date
    -- UNTIL must be part of the RRULE line
    IF availability_rrule_str IS NOT NULL THEN
      -- Replace BYDAY in availability pattern with correct day for mission
      -- This ensures the RRULE matches the actual mission date, not the availability's day
      -- Remove any existing UNTIL from the availability pattern and add mission UNTIL
      -- Handle UNTIL at start, middle, or end of RRULE string
      availability_rrule_str := regexp_replace(availability_rrule_str, ';UNTIL=[^;]+', '', 'g');
      availability_rrule_str := regexp_replace(availability_rrule_str, '^UNTIL=[^;]+;?', '', 'g');
      availability_rrule_str := regexp_replace(availability_rrule_str, 'UNTIL=[^;]+$', '', 'g');
      generated_rrule := generated_rrule || E'\nRRULE:' ||
        regexp_replace(availability_rrule_str, 'BYDAY=[A-Z]{2}(,[A-Z]{2})*', 'BYDAY=' || rrule_day, 'g') ||
        ';UNTIL=' ||
        TO_CHAR(mission_until_ts, 'YYYYMMDD') ||
        'T' || LPAD(hour::TEXT, 2, '0') ||
        '0000Z';
    ELSE
      -- Fallback to simple weekly pattern with UNTIL
      generated_rrule := generated_rrule || E'\nRRULE:FREQ=WEEKLY;BYDAY=' || rrule_day ||
        ';UNTIL=' ||
        TO_CHAR(mission_until_ts, 'YYYYMMDD') ||
        'T' || LPAD(hour::TEXT, 2, '0') ||
        '0000Z';
    END IF;

    -- Add EXDATE if present
    IF array_length(exdate_lines, 1) > 0 THEN
      generated_rrule := generated_rrule || E'\n' || array_to_string(exdate_lines, E'\n');
    END IF;
  ELSE
    -- No matching availability found - generate a simple weekly RRULE
    -- This reflects the system: we accept any RRULE, even outside availabilities
    -- UNTIL must be part of the RRULE line
    generated_rrule := 'DTSTART:' ||
      TO_CHAR(mission_dtstart_ts, 'YYYYMMDD') ||
      'T' || LPAD(hour::TEXT, 2, '0') ||
      '0000Z' ||
      E'\nRRULE:FREQ=WEEKLY;BYDAY=' || rrule_day ||
      ';UNTIL=' ||
      TO_CHAR(mission_until_ts, 'YYYYMMDD') ||
      'T' || LPAD(hour::TEXT, 2, '0') ||
      '0000Z';
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
    status_param::public.mission_status,
    mission_dtstart_ts,
    mission_until_ts
  )
  RETURNING id INTO mission_id_result;

  -- Create mission schedule
  -- Use the requested duration_minutes, not the availability's full duration
  INSERT INTO public.mission_schedules (
    mission_id,
    rrule,
    duration_mn
  ) VALUES (
    mission_id_result,
    generated_rrule,
    duration_minutes
  );

  RETURN mission_id_result;
END;
$$ LANGUAGE plpgsql SET search_path = '';

COMMENT ON FUNCTION public.seeds_create_mission_from_availability(UUID, UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT) IS 'Creates a mission with schedule from matching availability. Used for seeding. Finds availability by day/hour/duration and generates schedule RRULE with mission date constraints.';

-- Function to create a mission with a custom RRULE (for testing missions outside availabilities)
CREATE OR REPLACE FUNCTION public.seeds_create_mission_with_custom_rrule(
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
  mission_id_result UUID;
  generated_rrule TEXT;
  rrule_day TEXT;
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

  -- Get RRULE day abbreviation from actual target_date
  target_dow := EXTRACT(DOW FROM target_date)::INTEGER;
  rrule_day := CASE target_dow
    WHEN 0 THEN 'SU'
    WHEN 1 THEN 'MO'
    WHEN 2 THEN 'TU'
    WHEN 3 THEN 'WE'
    WHEN 4 THEN 'TH'
    WHEN 5 THEN 'FR'
    WHEN 6 THEN 'SA'
  END;

  -- Generate RRULE for weekly recurrence
  -- UNTIL must be part of the RRULE line
  generated_rrule := 'DTSTART:' ||
    TO_CHAR(mission_dtstart_ts, 'YYYYMMDD') ||
    'T' || LPAD(hour::TEXT, 2, '0') ||
    '0000Z' ||
    E'\nRRULE:FREQ=WEEKLY;BYDAY=' || rrule_day ||
    ';UNTIL=' ||
    TO_CHAR(mission_until_ts, 'YYYYMMDD') ||
    'T' || LPAD(hour::TEXT, 2, '0') ||
    '0000Z';

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
    status_param::public.mission_status,
    mission_dtstart_ts,
    mission_until_ts
  )
  RETURNING id INTO mission_id_result;

  -- Create mission schedule
  INSERT INTO public.mission_schedules (
    mission_id,
    rrule,
    duration_mn
  ) VALUES (
    mission_id_result,
    generated_rrule,
    duration_minutes
  );

  RETURN mission_id_result;
END;
$$ LANGUAGE plpgsql SET search_path = '';

COMMENT ON FUNCTION public.seeds_create_mission_with_custom_rrule(UUID, UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT) IS 'Creates a mission with a custom RRULE schedule. Used for seeding missions outside professional availabilities (for testing).';

