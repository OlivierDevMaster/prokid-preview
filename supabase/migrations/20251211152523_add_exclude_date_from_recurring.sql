-- Migration: add_exclude_date_from_recurring
-- Purpose: Add function to exclude specific dates from recurring availabilities
-- Affected objects: add_exdate_to_recurring_availability function

-- Function to add EXDATE to an existing recurring availability
CREATE OR REPLACE FUNCTION public.add_exdate_to_recurring_availability(
  availability_id_param UUID,
  date_to_exclude TIMESTAMP WITH TIME ZONE
) RETURNS TEXT AS $$
DECLARE
  current_rrule TEXT;
  rrule_lines TEXT[];
  line TEXT;
  dtstart_str TEXT;
  rrule_str TEXT;
  exdate_str TEXT;
  new_exdate_str TEXT;
  hour_val INTEGER;
  minute_val INTEGER;
  final_rrule TEXT;
  exdate_formatted TEXT;
  has_exdate BOOLEAN := false;
BEGIN
  -- Get current RRULE
  SELECT rrule INTO current_rrule
  FROM public.availabilities
  WHERE id = availability_id_param;

  IF current_rrule IS NULL THEN
    RETURN 'Availability not found';
  END IF;

  -- Check if it's a recurring availability (FREQ=WEEKLY)
  IF current_rrule !~* 'FREQ=WEEKLY' THEN
    RETURN 'Not a recurring availability';
  END IF;

  -- Split RRULE by newlines
  rrule_lines := string_to_array(current_rrule, E'\n');

  -- Parse existing RRULE
  dtstart_str := NULL;
  rrule_str := NULL;
  exdate_str := NULL;

  FOREACH line IN ARRAY rrule_lines
  LOOP
    IF line ~* '^DTSTART:' THEN
      dtstart_str := line;
    ELSIF line ~* '^RRULE:' THEN
      rrule_str := line;
    ELSIF line ~* '^EXDATE:' THEN
      exdate_str := line;
      has_exdate := true;
    END IF;
  END LOOP;

  -- Extract hour from DTSTART or use hour from date_to_exclude
  IF dtstart_str IS NOT NULL THEN
    hour_val := substring(dtstart_str from 'T(\d{2})')::INTEGER;
    minute_val := substring(dtstart_str from 'T\d{2}(\d{2})')::INTEGER;
  ELSE
    hour_val := EXTRACT(HOUR FROM date_to_exclude)::INTEGER;
    minute_val := EXTRACT(MINUTE FROM date_to_exclude)::INTEGER;
  END IF;

  -- Format EXDATE: YYYYMMDDTHHMMSSZ
  exdate_formatted := TO_CHAR(date_to_exclude, 'YYYYMMDD') || 'T' ||
                      LPAD(hour_val::TEXT, 2, '0') ||
                      LPAD(minute_val::TEXT, 2, '0') || '00Z';

  -- Add to existing EXDATE or create new one
  IF has_exdate AND exdate_str IS NOT NULL THEN
    -- Check if this date is already excluded
    IF exdate_str ~ exdate_formatted THEN
      RETURN 'Date already excluded';
    END IF;
    -- Append to existing EXDATE
    new_exdate_str := exdate_str || ',' || exdate_formatted;
  ELSE
    -- Create new EXDATE
    new_exdate_str := 'EXDATE:' || exdate_formatted;
  END IF;

  -- Rebuild RRULE
  final_rrule := dtstart_str;
  IF rrule_str IS NOT NULL THEN
    final_rrule := final_rrule || E'\n' || rrule_str;
  END IF;
  final_rrule := final_rrule || E'\n' || new_exdate_str;

  -- Update availability
  UPDATE public.availabilities
  SET rrule = final_rrule
  WHERE id = availability_id_param;

  RETURN 'EXDATE added successfully';
END;
$$ LANGUAGE plpgsql SET search_path = '';

COMMENT ON FUNCTION public.add_exdate_to_recurring_availability(UUID, TIMESTAMP WITH TIME ZONE) IS 'Adds an EXDATE to an existing recurring availability to exclude a specific date';
