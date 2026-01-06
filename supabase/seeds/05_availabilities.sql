-- Seed: availabilities
-- Purpose: Create availability entries for professionals using RRULE format
-- RRULE format: DTSTART:YYYYMMDDTHHMMSSZ\nRRULE:BYDAY=...;FREQ=WEEKLY
-- Note: RRULE format uses newlines (not semicolons). Duration is stored separately in duration_mn column.
-- Note: Hardcoded RRULEs with calculated dates to avoid overlaps

-- Professional 010 (John Doe) - Therapist with morning and afternoon sessions
-- Monday 9am-12pm (180 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_monday, 'YYYYMMDD') || 'T090000Z' || E'\n' || 'RRULE:BYDAY=MO;FREQ=WEEKLY',
  180,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

-- Monday 2pm-6pm (240 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_monday, 'YYYYMMDD') || 'T140000Z' || E'\n' || 'RRULE:BYDAY=MO;FREQ=WEEKLY',
  240,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

-- Wednesday 10am-4pm (360 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_wednesday, 'YYYYMMDD') || 'T100000Z' || E'\n' || 'RRULE:BYDAY=WE;FREQ=WEEKLY',
  360,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) w;

-- Professional 011 (Marie Martin) - Doctor with regular hours
-- Monday 8am-1pm (300 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_monday, 'YYYYMMDD') || 'T080000Z' || E'\n' || 'RRULE:BYDAY=MO;FREQ=WEEKLY',
  300,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

-- Tuesday 2pm-6pm (240 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_tuesday, 'YYYYMMDD') || 'T140000Z' || E'\n' || 'RRULE:BYDAY=TU;FREQ=WEEKLY',
  240,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) t;

-- Thursday 9am-3pm (360 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_thursday, 'YYYYMMDD') || 'T090000Z' || E'\n' || 'RRULE:BYDAY=TH;FREQ=WEEKLY',
  360,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
FROM (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
) th;

-- Professional 012 (Pierre Dupont) - Consultant with flexible hours
-- Monday 1pm-5pm (240 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_monday, 'YYYYMMDD') || 'T130000Z' || E'\n' || 'RRULE:BYDAY=MO;FREQ=WEEKLY',
  240,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

-- Wednesday 9am-12pm (180 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_wednesday, 'YYYYMMDD') || 'T090000Z' || E'\n' || 'RRULE:BYDAY=WE;FREQ=WEEKLY',
  180,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) w;

-- Wednesday 2pm-6pm (240 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_wednesday, 'YYYYMMDD') || 'T140000Z' || E'\n' || 'RRULE:BYDAY=WE;FREQ=WEEKLY',
  240,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) w;

-- Professional 013 (Sophie Bernard) - Part-time availability
-- Monday 9am-3pm (360 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_monday, 'YYYYMMDD') || 'T090000Z' || E'\n' || 'RRULE:BYDAY=MO;FREQ=WEEKLY',
  360,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

-- Tuesday 10am-4pm (360 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_tuesday, 'YYYYMMDD') || 'T100000Z' || E'\n' || 'RRULE:BYDAY=TU;FREQ=WEEKLY',
  360,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) t;

-- Thursday 8am-1pm (300 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_thursday, 'YYYYMMDD') || 'T080000Z' || E'\n' || 'RRULE:BYDAY=TH;FREQ=WEEKLY',
  300,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
FROM (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
) th;

-- Professional 014 (Thomas Leroy) - Evening specialist
-- Tuesday 2pm-6pm (240 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_tuesday, 'YYYYMMDD') || 'T140000Z' || E'\n' || 'RRULE:BYDAY=TU;FREQ=WEEKLY',
  240,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) t;

-- Wednesday 9am-5pm (480 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_wednesday, 'YYYYMMDD') || 'T090000Z' || E'\n' || 'RRULE:BYDAY=WE;FREQ=WEEKLY',
  480,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) w;

-- Friday 10am-4pm (360 min)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(next_friday, 'YYYYMMDD') || 'T100000Z' || E'\n' || 'RRULE:BYDAY=FR;FREQ=WEEKLY',
  360,
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
FROM (
  SELECT
    CASE
      WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_friday
) f;
