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

-- ============================================================================
-- Additional missions for existing professionals using new Friday availabilities
-- ============================================================================

-- Professional 010 (John Doe) - From Structure 1 - Friday 8am-12pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_friday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
    'Friday Morning Session',
    'Early morning care session',
    'pending',
    (next_friday + INTERVAL '8 hours')::TIMESTAMP WITH TIME ZONE,
    (next_friday + INTERVAL '8 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T080000Z' || E'\n' ||
  'RRULE:BYDAY=FR;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T080000Z',
  240
FROM mission_insert m;

-- Professional 011 (Marie Martin) - From Structure 1 - Friday 9am-1pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_friday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
    'Friday Morning Care',
    'Friday morning childcare',
    'pending',
    (next_friday + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE,
    (next_friday + INTERVAL '9 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=FR;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T090000Z',
  240
FROM mission_insert m;

-- Professional 014 (Thomas Leroy) - From Structure 5 - Thursday 2pm-6pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae6',
    'Thursday Afternoon Care',
    'Thursday afternoon session',
    'pending',
    (next_thursday + INTERVAL '14 hours')::TIMESTAMP WITH TIME ZONE,
    (next_thursday + INTERVAL '14 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T140000Z' || E'\n' ||
  'RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T140000Z',
  240
FROM mission_insert m;

-- ============================================================================
-- Missions for new professionals (ae7, ae8, ae9, aea, aeb)
-- ============================================================================

-- Professional 015 (Lucie Moreau - ae7) - From Structure 5
-- Monday 7am-11am (240 min), week 0
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
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae7',
    'Early Monday Morning',
    'Early morning care session',
    'pending',
    (next_monday + INTERVAL '7 hours')::TIMESTAMP WITH TIME ZONE,
    (next_monday + INTERVAL '7 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T070000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T070000Z',
  240
FROM mission_insert m;

-- Professional 015 (Lucie Moreau - ae7) - Wednesday 8am-12pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae7',
    'Wednesday Morning Session',
    'Wednesday morning care',
    'pending',
    (next_wednesday + INTERVAL '8 hours')::TIMESTAMP WITH TIME ZONE,
    (next_wednesday + INTERVAL '8 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T080000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T080000Z',
  240
FROM mission_insert m;

-- Professional 016 (Antoine Petit - ae8) - From Structure 1
-- Tuesday 1pm-5pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae8',
    'Tuesday Afternoon Care',
    'Afternoon childcare session',
    'pending',
    (next_tuesday + INTERVAL '13 hours')::TIMESTAMP WITH TIME ZONE,
    (next_tuesday + INTERVAL '13 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T130000Z' || E'\n' ||
  'RRULE:BYDAY=TU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T130000Z',
  240
FROM mission_insert m;

-- Professional 016 (Antoine Petit - ae8) - Thursday 1pm-5pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae8',
    'Thursday Afternoon Session',
    'Thursday afternoon care',
    'pending',
    (next_thursday + INTERVAL '13 hours')::TIMESTAMP WITH TIME ZONE,
    (next_thursday + INTERVAL '13 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T130000Z' || E'\n' ||
  'RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T130000Z',
  240
FROM mission_insert m;

-- Professional 017 (Camille Laurent - ae9) - From Structure 1
-- Tuesday 8am-12pm (240 min), week 0 (using part of full day availability)
WITH date_calc AS (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae9',
    'Tuesday Morning Care',
    'Morning care session',
    'pending',
    (next_tuesday + INTERVAL '8 hours')::TIMESTAMP WITH TIME ZONE,
    (next_tuesday + INTERVAL '8 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T080000Z' || E'\n' ||
  'RRULE:BYDAY=TU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T080000Z',
  240
FROM mission_insert m;

-- Professional 017 (Camille Laurent - ae9) - Thursday 9am-1pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae9',
    'Thursday Morning Session',
    'Thursday morning care',
    'pending',
    (next_thursday + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE,
    (next_thursday + INTERVAL '9 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T090000Z',
  240
FROM mission_insert m;

-- Professional 018 (Julien Simon - aea) - From Structure 2
-- Monday 10am-2pm (240 min), week 0
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
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aea',
    'Monday Midday Care',
    'Midday care session',
    'pending',
    (next_monday + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
    (next_monday + INTERVAL '10 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T100000Z',
  240
FROM mission_insert m;

-- Professional 018 (Julien Simon - aea) - Wednesday 11am-3pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aea',
    'Wednesday Midday Session',
    'Wednesday midday care',
    'pending',
    (next_wednesday + INTERVAL '11 hours')::TIMESTAMP WITH TIME ZONE,
    (next_wednesday + INTERVAL '11 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T110000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T110000Z',
  240
FROM mission_insert m;

-- Professional 019 (Emilie Michel - aeb) - From Structure 3
-- Saturday 9am-1pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (6 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_saturday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aeb',
    'Saturday Morning Care',
    'Weekend morning care session',
    'pending',
    (next_saturday + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE,
    (next_saturday + INTERVAL '9 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=SA;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T090000Z',
  240
FROM mission_insert m;

-- Professional 019 (Emilie Michel - aeb) - Sunday 10am-2pm (240 min), week 0
WITH date_calc AS (
  SELECT
    CASE
      WHEN (0 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((0 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_sunday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aeb',
    'Sunday Morning Session',
    'Sunday morning care',
    'pending',
    (next_sunday + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
    (next_sunday + INTERVAL '10 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=SU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T100000Z',
  240
FROM mission_insert m;

-- ============================================================================
-- Additional pending missions (2 per professional) for better test coverage
-- ============================================================================

-- Professional 010 (John Doe) - Additional pending missions
-- From Structure 1 - Monday 2pm-5pm (180 min) - using part of his Monday 2pm-6pm availability
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
    'Monday Afternoon Extended',
    'Extended afternoon care session',
    'pending',
    (next_monday + INTERVAL '14 hours' + INTERVAL '30 minutes')::TIMESTAMP WITH TIME ZONE,
    (next_monday + INTERVAL '14 hours' + INTERVAL '30 minutes' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T143000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T143000Z',
  180
FROM mission_insert m;

-- From Structure 2 - Wednesday 2pm-4pm (120 min) - using part of his Wednesday 10am-4pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
    'Wednesday Afternoon Session',
    'Afternoon care and support',
    'pending',
    (next_wednesday + INTERVAL '14 hours')::TIMESTAMP WITH TIME ZONE,
    (next_wednesday + INTERVAL '14 hours' + INTERVAL '120 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T140000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '120 minutes', 'YYYYMMDD') || 'T140000Z',
  120
FROM mission_insert m;

-- Professional 011 (Marie Martin) - Additional pending missions
-- From Structure 1 - Thursday 10am-2pm (240 min) - using part of her Thursday 9am-3pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
    'Thursday Midday Care',
    'Midday healthcare session',
    'pending',
    (next_thursday + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
    (next_thursday + INTERVAL '10 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T100000Z',
  240
FROM mission_insert m;

-- From Structure 3 - Friday 10am-1pm (180 min) - using part of her Friday 9am-1pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_friday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
    'Friday Morning Extended',
    'Extended Friday morning care',
    'pending',
    (next_friday + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
    (next_friday + INTERVAL '10 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=FR;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T100000Z',
  180
FROM mission_insert m;

-- Professional 012 (Pierre Dupont) - Additional pending missions
-- From Structure 2 - Wednesday 3pm-6pm (180 min) - using part of his Wednesday 2pm-6pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae4',
    'Wednesday Late Afternoon',
    'Late afternoon consultation',
    'pending',
    (next_wednesday + INTERVAL '15 hours')::TIMESTAMP WITH TIME ZONE,
    (next_wednesday + INTERVAL '15 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T150000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T150000Z',
  180
FROM mission_insert m;

-- From Structure 4 - Friday 12pm-3pm (180 min) - using part of his Friday 11am-3pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_friday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae4',
    'Friday Midday Consultation',
    'Midday consultation session',
    'pending',
    (next_friday + INTERVAL '12 hours')::TIMESTAMP WITH TIME ZONE,
    (next_friday + INTERVAL '12 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T120000Z' || E'\n' ||
  'RRULE:BYDAY=FR;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T120000Z',
  180
FROM mission_insert m;

-- Professional 013 (Sophie Bernard) - Additional pending missions
-- From Structure 3 - Tuesday 11am-3pm (240 min) - using part of her Tuesday 10am-4pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae5',
    'Tuesday Midday Session',
    'Midday care session',
    'pending',
    (next_tuesday + INTERVAL '11 hours')::TIMESTAMP WITH TIME ZONE,
    (next_tuesday + INTERVAL '11 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T110000Z' || E'\n' ||
  'RRULE:BYDAY=TU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T110000Z',
  240
FROM mission_insert m;

-- From Structure 4 - Friday 2pm-5pm (180 min) - using part of her Friday 1pm-5pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_friday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae5',
    'Friday Afternoon Care',
    'Friday afternoon childcare',
    'pending',
    (next_friday + INTERVAL '14 hours')::TIMESTAMP WITH TIME ZONE,
    (next_friday + INTERVAL '14 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T140000Z' || E'\n' ||
  'RRULE:BYDAY=FR;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T140000Z',
  180
FROM mission_insert m;

-- Professional 014 (Thomas Leroy) - Additional pending missions
-- From Structure 5 - Thursday 3pm-6pm (180 min) - using part of his Thursday 2pm-6pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae6',
    'Thursday Late Afternoon',
    'Late afternoon specialist session',
    'pending',
    (next_thursday + INTERVAL '15 hours')::TIMESTAMP WITH TIME ZONE,
    (next_thursday + INTERVAL '15 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T150000Z' || E'\n' ||
  'RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T150000Z',
  180
FROM mission_insert m;

-- From Structure 5 - Friday 11am-3pm (240 min) - using part of his Friday 10am-4pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_friday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae6',
    'Friday Midday Specialist',
    'Friday midday specialist care',
    'pending',
    (next_friday + INTERVAL '11 hours')::TIMESTAMP WITH TIME ZONE,
    (next_friday + INTERVAL '11 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T110000Z' || E'\n' ||
  'RRULE:BYDAY=FR;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T110000Z',
  240
FROM mission_insert m;

-- Professional 015 (Lucie Moreau - ae7) - Additional pending missions
-- From Structure 5 - Monday 8am-11am (180 min) - using part of her Monday 7am-11am availability
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
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae7',
    'Monday Morning Extended',
    'Extended Monday morning care',
    'pending',
    (next_monday + INTERVAL '8 hours')::TIMESTAMP WITH TIME ZONE,
    (next_monday + INTERVAL '8 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T080000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T080000Z',
  180
FROM mission_insert m;

-- From Structure 5 - Friday 10am-1pm (180 min) - using part of her Friday 9am-1pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((5 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_friday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae7',
    'Friday Morning Session',
    'Friday morning care session',
    'pending',
    (next_friday + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
    (next_friday + INTERVAL '10 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=FR;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T100000Z',
  180
FROM mission_insert m;

-- Professional 016 (Antoine Petit - ae8) - Additional pending missions
-- From Structure 1 - Tuesday 2pm-5pm (180 min) - using part of his Tuesday 1pm-5pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae8',
    'Tuesday Afternoon Extended',
    'Extended afternoon care',
    'pending',
    (next_tuesday + INTERVAL '14 hours')::TIMESTAMP WITH TIME ZONE,
    (next_tuesday + INTERVAL '14 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T140000Z' || E'\n' ||
  'RRULE:BYDAY=TU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T140000Z',
  180
FROM mission_insert m;

-- From Structure 1 - Thursday 2pm-5pm (180 min) - using part of his Thursday 1pm-5pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae8',
    'Thursday Afternoon Extended',
    'Extended Thursday afternoon care',
    'pending',
    (next_thursday + INTERVAL '14 hours')::TIMESTAMP WITH TIME ZONE,
    (next_thursday + INTERVAL '14 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T140000Z' || E'\n' ||
  'RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T140000Z',
  180
FROM mission_insert m;

-- Professional 017 (Camille Laurent - ae9) - Additional pending missions
-- From Structure 1 - Tuesday 9am-1pm (240 min) - using part of her Tuesday 8am-4pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((2 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_tuesday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae9',
    'Tuesday Morning Extended',
    'Extended Tuesday morning care',
    'pending',
    (next_tuesday + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE,
    (next_tuesday + INTERVAL '9 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=TU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T090000Z',
  240
FROM mission_insert m;

-- From Structure 1 - Thursday 10am-2pm (240 min) - using part of her Thursday 9am-3pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((4 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_thursday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae9',
    'Thursday Midday Care',
    'Thursday midday care session',
    'pending',
    (next_thursday + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
    (next_thursday + INTERVAL '10 hours' + INTERVAL '240 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '240 minutes', 'YYYYMMDD') || 'T100000Z',
  240
FROM mission_insert m;

-- Professional 018 (Julien Simon - aea) - Additional pending missions
-- From Structure 2 - Monday 11am-2pm (180 min) - using part of his Monday 10am-2pm availability
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
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aea',
    'Monday Midday Extended',
    'Extended midday care',
    'pending',
    (next_monday + INTERVAL '11 hours')::TIMESTAMP WITH TIME ZONE,
    (next_monday + INTERVAL '11 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T110000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T110000Z',
  180
FROM mission_insert m;

-- From Structure 2 - Wednesday 12pm-3pm (180 min) - using part of his Wednesday 11am-3pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((3 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_wednesday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aea',
    'Wednesday Midday Session',
    'Wednesday midday care session',
    'pending',
    (next_wednesday + INTERVAL '12 hours')::TIMESTAMP WITH TIME ZONE,
    (next_wednesday + INTERVAL '12 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T120000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T120000Z',
  180
FROM mission_insert m;

-- Professional 019 (Emilie Michel - aeb) - Additional pending missions
-- From Structure 3 - Saturday 10am-1pm (180 min) - using part of her Saturday 9am-1pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (6 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_saturday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aeb',
    'Saturday Midday Care',
    'Saturday midday care session',
    'pending',
    (next_saturday + INTERVAL '10 hours')::TIMESTAMP WITH TIME ZONE,
    (next_saturday + INTERVAL '10 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T100000Z' || E'\n' ||
  'RRULE:BYDAY=SA;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T100000Z',
  180
FROM mission_insert m;

-- From Structure 3 - Sunday 11am-2pm (180 min) - using part of her Sunday 10am-2pm availability
WITH date_calc AS (
  SELECT
    CASE
      WHEN (0 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 = 0
      THEN CURRENT_DATE + 7
      ELSE CURRENT_DATE + ((0 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7)::INTEGER
    END AS next_sunday
),
mission_insert AS (
  INSERT INTO public.missions (structure_id, professional_id, title, description, status, mission_dtstart, mission_until)
  SELECT
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aeb',
    'Sunday Midday Session',
    'Sunday midday care session',
    'pending',
    (next_sunday + INTERVAL '11 hours')::TIMESTAMP WITH TIME ZONE,
    (next_sunday + INTERVAL '11 hours' + INTERVAL '180 minutes')::TIMESTAMP WITH TIME ZONE
  FROM date_calc
  RETURNING id, mission_dtstart
)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T110000Z' || E'\n' ||
  'RRULE:BYDAY=SU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(m.mission_dtstart + INTERVAL '180 minutes', 'YYYYMMDD') || 'T110000Z',
  180
FROM mission_insert m;
