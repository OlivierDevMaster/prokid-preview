-- Migration: utils
-- Purpose: Create utility functions for database operations
-- Affected objects: update_updated_at_column function, get_rrule_day function

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
$$ LANGUAGE SQL STABLE;

-- Helper function to get date string for EXDATE (simplifies formatting)
CREATE OR REPLACE FUNCTION public.format_exdate(date_offset INTEGER) RETURNS TEXT AS $$
BEGIN
  RETURN TO_CHAR(CURRENT_DATE + (date_offset::TEXT || ' days')::INTERVAL, 'YYYYMMDD') || 'T' ||
         TO_CHAR(CURRENT_DATE + (date_offset::TEXT || ' days')::INTERVAL, 'HH24MI') || '00Z';
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to create recurring availability with optional EXDATE
CREATE OR REPLACE FUNCTION public.create_recurring_availability(
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
  rrule_text := E'\nRRULE:BYDAY=' || public.get_rrule_day(day_offset) || ';FREQ=WEEKLY';

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
$$ LANGUAGE plpgsql;

-- Function to create one-time availability
CREATE OR REPLACE FUNCTION public.create_onetime_availability(
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
$$ LANGUAGE plpgsql;
