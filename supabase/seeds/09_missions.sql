-- Seed: missions
-- Purpose: Create mission entries for professionals who are members of structures
-- Note: Missions now use mission_schedules table with RRULEs constrained by mission dates
-- Note: Structure memberships are created automatically via triggers when structure invitations are accepted
-- Note: This seed file requires structure_invitations seed (08_structure_invitations.sql) and availabilities seed (05_availabilities.sql) to be run first
-- Note: Hardcoded missions with hardcoded RRULEs to avoid overlaps
-- Note: All RRULEs are constrained by mission dates with UNTIL clause

-- ============================================================================
-- Professional 010 (John Doe) - Member of structures: af9, afa
-- Availability: Mon 9am-12pm, Mon 2pm-6pm, Wed 10am-4pm
-- ============================================================================

-- From Structure 1 (af9) - Monday 2pm-6pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
    'Monday Afternoon Session',
    'Afternoon childcare and activities',
    'pending',
    (next_monday + INTERVAL '14 hours')::TIMESTAMP WITH TIME ZONE,
    (next_monday + INTERVAL '14 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T140000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T140000Z',
  240
FROM mission_insert m;

-- From Structure 1 (af9) - Wednesday 10am-2pm (240 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
  'Wednesday Morning',
  'Morning care session',
  'pending',
  (next_wednesday + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
  (next_wednesday + INTERVAL '10 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) w;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_wednesday + INTERVAL '10 hours', 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_wednesday + INTERVAL '10 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T100000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
    AND title = 'Wednesday Morning'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 2 (afa) - Monday 9am-12pm (180 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
  'Monday Morning Care',
  'Morning therapy sessions',
  'pending',
  (next_monday + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE,
  (next_monday + INTERVAL '9 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_monday + INTERVAL '9 hours', 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_monday + INTERVAL '9 hours' + INTERVAL '180 minutes', 'YYYYMMDD') || 'T090000Z',
  180
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
    AND title = 'Monday Morning Care'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 2 (afa) - Wednesday 10am-2pm (240 min), week 1
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
  'Second Week Wednesday',
  'Midday care for second week',
  'pending',
  (next_wednesday + INTERVAL '7 days' + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
  (next_wednesday + INTERVAL '7 days' + INTERVAL '10 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) w;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_wednesday + INTERVAL '7 days' + INTERVAL '10 hours', 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_wednesday + INTERVAL '7 days' + INTERVAL '10 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T100000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
    AND title = 'Second Week Wednesday'
  ORDER BY created_at DESC LIMIT 1
) m;

-- ============================================================================
-- Professional 011 (Marie Martin) - Member of structures: af9, afb
-- Availability: Mon 8am-1pm, Tue 2pm-6pm, Thu 9am-3pm
-- ============================================================================

-- From Structure 1 (af9) - Monday 8am-1pm (300 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
  'Monday Full Morning',
  'Complete morning care session',
  'pending',
  (next_monday + INTERVAL '8 hours')::TIMESTAMP WITH TIME ZONE,
  (next_monday + INTERVAL '8 hours' + INTERVAL '300 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_monday + INTERVAL '8 hours', 'YYYYMMDD') || 'T080000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_monday + INTERVAL '8 hours' + INTERVAL '300 minutes', 'YYYYMMDD') || 'T080000Z',
  300
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
    AND title = 'Monday Full Morning'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 1 (af9) - Thursday 9am-1pm (240 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
  'Thursday Morning',
  'Morning care for toddlers',
  'pending',
  (next_thursday + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE,
  (next_thursday + INTERVAL '9 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
) th;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_thursday + INTERVAL '9 hours', 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_thursday + INTERVAL '9 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T090000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
    AND title = 'Thursday Morning'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 3 (afb) - Tuesday 2pm-6pm (240 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
  'Tuesday Afternoon',
  'Afternoon care with activities',
  'pending',
  (next_tuesday + INTERVAL '14 hours')::TIMESTAMP WITH TIME ZONE,
  (next_tuesday + INTERVAL '14 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) t;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_tuesday + INTERVAL '14 hours', 'YYYYMMDD') || 'T140000Z' || E'\n' ||
  'RRULE:BYDAY=TU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_tuesday + INTERVAL '14 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T140000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
    AND title = 'Tuesday Afternoon'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 3 (afb) - Monday 8am-12pm (240 min), week 1
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
  'Second Week Monday',
  'Early morning session',
  'pending',
  (next_monday + INTERVAL '7 days' + INTERVAL '8 hours')::TIMESTAMP WITH TIME ZONE,
  (next_monday + INTERVAL '7 days' + INTERVAL '8 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_monday + INTERVAL '7 days' + INTERVAL '8 hours', 'YYYYMMDD') || 'T080000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_monday + INTERVAL '7 days' + INTERVAL '8 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T080000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
    AND title = 'Second Week Monday'
  ORDER BY created_at DESC LIMIT 1
) m;

-- ============================================================================
-- Professional 012 (Pierre Dupont) - Member of structures: afa, afc
-- Availability: Mon 1pm-5pm, Wed 9am-12pm, Wed 2pm-6pm
-- ============================================================================

-- From Structure 2 (afa) - Monday 1pm-5pm (240 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae4',
  'Monday Afternoon Consultation',
  'Afternoon consultation session',
  'pending',
  (next_monday + INTERVAL '13 hours')::TIMESTAMP WITH TIME ZONE,
  (next_monday + INTERVAL '13 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_monday + INTERVAL '13 hours', 'YYYYMMDD') || 'T130000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_monday + INTERVAL '13 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T130000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
    AND title = 'Monday Afternoon Consultation'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 2 (afa) - Wednesday 2pm-6pm (240 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae4',
  'Wednesday Afternoon',
  'Afternoon care session',
  'pending',
  (next_wednesday + INTERVAL '14 hours')::TIMESTAMP WITH TIME ZONE,
  (next_wednesday + INTERVAL '14 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) w;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_wednesday + INTERVAL '14 hours', 'YYYYMMDD') || 'T140000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_wednesday + INTERVAL '14 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T140000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
    AND title = 'Wednesday Afternoon'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 4 (afc) - Wednesday 9am-12pm (180 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae4',
  'Wednesday Morning',
  'Morning consultation',
  'pending',
  (next_wednesday + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE,
  (next_wednesday + INTERVAL '9 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) w;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_wednesday + INTERVAL '9 hours', 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_wednesday + INTERVAL '9 hours' + INTERVAL '180 minutes', 'YYYYMMDD') || 'T090000Z',
  180
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
    AND title = 'Wednesday Morning'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 4 (afc) - Monday 1pm-5pm (240 min), week 1
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae4',
  'Second Week Monday',
  'Monday afternoon from Structure 4',
  'pending',
  (next_monday + INTERVAL '7 days' + INTERVAL '13 hours')::TIMESTAMP WITH TIME ZONE,
  (next_monday + INTERVAL '7 days' + INTERVAL '13 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_monday + INTERVAL '7 days' + INTERVAL '13 hours', 'YYYYMMDD') || 'T130000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_monday + INTERVAL '7 days' + INTERVAL '13 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T130000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
    AND title = 'Second Week Monday'
  ORDER BY created_at DESC LIMIT 1
) m;

-- ============================================================================
-- Professional 013 (Sophie Bernard) - Member of structures: afb, afc, afd
-- Availability: Mon 9am-3pm, Tue 10am-4pm, Thu 8am-1pm
-- ============================================================================

-- From Structure 3 (afb) - Monday 9am-12pm (180 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae5',
  'Monday Morning Care',
  'Morning care for preschool',
  'pending',
  (next_monday + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE,
  (next_monday + INTERVAL '9 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_monday + INTERVAL '9 hours', 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_monday + INTERVAL '9 hours' + INTERVAL '180 minutes', 'YYYYMMDD') || 'T090000Z',
  180
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
    AND title = 'Monday Morning Care'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 3 (afb) - Tuesday 10am-2pm (240 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae5',
  'Tuesday Midday',
  'Midday care with lunch',
  'pending',
  (next_tuesday + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
  (next_tuesday + INTERVAL '10 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) t;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_tuesday + INTERVAL '10 hours', 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=TU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_tuesday + INTERVAL '10 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T100000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
    AND title = 'Tuesday Midday'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 4 (afc) - Thursday 8am-12pm (240 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae5',
  'Thursday Morning Care',
  'Thursday morning care session',
  'pending',
  (next_thursday + INTERVAL '8 hours')::TIMESTAMP WITH TIME ZONE,
  (next_thursday + INTERVAL '8 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
) th;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_thursday + INTERVAL '8 hours', 'YYYYMMDD') || 'T080000Z' || E'\n' ||
  'RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_thursday + INTERVAL '8 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T080000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
    AND title = 'Thursday Morning Care'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 4 (afc) - Monday 9am-1pm (240 min), week 1
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae5',
  'Second Week Monday',
  'Extended morning session',
  'pending',
  (next_monday + INTERVAL '7 days' + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE,
  (next_monday + INTERVAL '7 days' + INTERVAL '9 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) m;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_monday + INTERVAL '7 days' + INTERVAL '9 hours', 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_monday + INTERVAL '7 days' + INTERVAL '9 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T090000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((1 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_monday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
    AND title = 'Second Week Monday'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 5 (afd) - Tuesday 10am-2pm (240 min), week 1
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae5',
  'Second Week Tuesday',
  'Tuesday from Structure 5',
  'pending',
  (next_tuesday + INTERVAL '7 days' + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
  (next_tuesday + INTERVAL '7 days' + INTERVAL '10 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) t;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_tuesday + INTERVAL '7 days' + INTERVAL '10 hours', 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=TU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_tuesday + INTERVAL '7 days' + INTERVAL '10 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T100000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
    AND title = 'Second Week Tuesday'
  ORDER BY created_at DESC LIMIT 1
) m;

-- ============================================================================
-- Professional 014 (Thomas Leroy) - Member of structure: afd
-- Availability: Tue 2pm-6pm, Wed 9am-5pm, Fri 10am-4pm
-- ============================================================================

-- From Structure 5 (afd) - Tuesday 2pm-6pm (240 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae6',
  'Tuesday Afternoon Care',
  'Afternoon care with outdoor activities',
  'pending',
  (next_tuesday + INTERVAL '14 hours')::TIMESTAMP WITH TIME ZONE,
  (next_tuesday + INTERVAL '14 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) t;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_tuesday + INTERVAL '14 hours', 'YYYYMMDD') || 'T140000Z' || E'\n' ||
  'RRULE:BYDAY=TU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_tuesday + INTERVAL '14 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T140000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
    AND title = 'Tuesday Afternoon Care'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 5 (afd) - Wednesday 9am-1pm (240 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae6',
  'Wednesday Morning',
  'Full morning session',
  'pending',
  (next_wednesday + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE,
  (next_wednesday + INTERVAL '9 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) w;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_wednesday + INTERVAL '9 hours', 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_wednesday + INTERVAL '9 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T090000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
    AND title = 'Wednesday Morning'
  ORDER BY created_at DESC LIMIT 1
) m;

-- From Structure 5 (afd) - Friday 10am-2pm (240 min), week 0
INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
SELECT
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae6',
  'Friday Midday Session',
  'Friday midday care',
  'pending',
  (next_friday + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
  (next_friday + INTERVAL '10 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
FROM (
  SELECT
    CASE
      WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_friday
) f;

INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(next_friday + INTERVAL '10 hours', 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=FR;FREQ=WEEKLY;UNTIL=' || TO_CHAR(next_friday + INTERVAL '10 hours' + INTERVAL '240 minutes', 'YYYYMMDD') || 'T100000Z',
  240
FROM (
  SELECT
    CASE
      WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_friday
) d
CROSS JOIN LATERAL (
  SELECT id FROM public.missions
  WHERE structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
    AND professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
    AND title = 'Friday Midday Session'
  ORDER BY created_at DESC LIMIT 1
) m;
