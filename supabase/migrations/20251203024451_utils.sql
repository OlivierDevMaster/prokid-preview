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
  duration_hours INTEGER,
  exdate_offsets INTEGER[] DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  rrule_text TEXT;
  exdate_text TEXT := '';
  i INTEGER;
BEGIN
  -- Build base RRULE
  rrule_text := 'DTSTART:' ||
                TO_CHAR(CURRENT_DATE + (day_offset::TEXT || ' days')::INTERVAL, 'YYYYMMDD') ||
                'T' || LPAD(hour::TEXT, 2, '0') || '0000Z;' ||
                'RRULE:FREQ=WEEKLY;BYDAY=' || public.get_rrule_day(day_offset) || ';' ||
                'DURATION:PT' || duration_hours || 'H';

  -- Add EXDATE if provided
  IF exdate_offsets IS NOT NULL AND array_length(exdate_offsets, 1) > 0 THEN
    exdate_text := ';EXDATE:';
    FOR i IN 1..array_length(exdate_offsets, 1) LOOP
      IF i > 1 THEN
        exdate_text := exdate_text || ',';
      END IF;
      exdate_text := exdate_text ||
                    TO_CHAR(CURRENT_DATE + (exdate_offsets[i]::TEXT || ' days')::INTERVAL, 'YYYYMMDD') ||
                    'T' || LPAD(hour::TEXT, 2, '0') || '0000Z';
    END LOOP;
  END IF;

  -- Insert the availability
  INSERT INTO public.availabilities (rrule, user_id)
  VALUES (rrule_text || exdate_text, user_id_param);

  RETURN 'Created availability for user ' || user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to create one-time availability
CREATE OR REPLACE FUNCTION public.create_onetime_availability(
  user_id_param UUID,
  day_offset INTEGER,
  hour INTEGER,
  duration_hours INTEGER
) RETURNS TEXT AS $$
BEGIN
  INSERT INTO public.availabilities (rrule, user_id)
  VALUES (
    'DTSTART:' ||
    TO_CHAR(CURRENT_DATE + (day_offset::TEXT || ' days')::INTERVAL, 'YYYYMMDD') ||
    'T' || LPAD(hour::TEXT, 2, '0') || '0000Z;' ||
    'DURATION:PT' || duration_hours || 'H',
    user_id_param
  );

  RETURN 'Created one-time availability for user ' || user_id_param;
END;
$$ LANGUAGE plpgsql;
