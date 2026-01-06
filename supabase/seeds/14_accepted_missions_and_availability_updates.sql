-- Seed: accepted_missions_and_availability_updates
-- Purpose: Update availabilities for accepted missions to reflect mission acceptance
-- Note: This simulates what happens when acceptMissionHandler processes mission acceptances
-- Note: When missions are accepted, availabilities are updated with UNTIL dates (just before mission starts)
-- Note: This seed file must run after 05_availabilities.sql and 09_missions.sql
-- Note: This file does NOT create new missions - it only updates availabilities for missions that are already accepted

-- ============================================================================
-- Update availabilities for accepted missions
-- ============================================================================
-- For each accepted mission, we need to:
-- 1. Find the original availability that overlaps with the mission
-- 2. Update it to have UNTIL = mission_dtstart - 1 second (so it ends just before mission starts)
-- 3. Create a post-mission availability starting after mission_until

-- Professional 010 (John Doe) - Monday 9am-12pm accepted mission
-- Update the Monday 9am-12pm availability to end just before the mission starts
WITH mission_info AS (
  SELECT
    m.mission_dtstart,
    m.mission_until,
    m.professional_id
  FROM public.missions m
  WHERE m.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
    AND m.status = 'accepted'
    AND m.title = 'Monday Morning Care'
    AND EXTRACT(HOUR FROM m.mission_dtstart) = 9
    AND EXTRACT(MINUTE FROM m.mission_dtstart) = 0
  ORDER BY m.mission_dtstart
  LIMIT 1
),
until_date AS (
  SELECT (mission_dtstart - INTERVAL '1 second')::TIMESTAMP WITH TIME ZONE AS until_ts
  FROM mission_info
)
UPDATE public.availabilities a
SET rrule = (
  SELECT
    'DTSTART:' || TO_CHAR(until_ts AT TIME ZONE 'UTC', 'YYYYMMDD') || 'T090000Z' || E'\n' ||
    'RRULE:BYDAY=MO;FREQ=WEEKLY;UNTIL=' || TO_CHAR(until_ts AT TIME ZONE 'UTC', 'YYYYMMDD') || 'T' ||
                 TO_CHAR(EXTRACT(HOUR FROM until_ts AT TIME ZONE 'UTC')::INTEGER, 'FM00') ||
                 TO_CHAR(EXTRACT(MINUTE FROM until_ts AT TIME ZONE 'UTC')::INTEGER, 'FM00') ||
                 TO_CHAR(EXTRACT(SECOND FROM until_ts AT TIME ZONE 'UTC')::INTEGER, 'FM00') || 'Z'
  FROM until_date
)
FROM mission_info mi
WHERE a.user_id = mi.professional_id
  AND a.rrule LIKE '%BYDAY=MO%'
  AND a.rrule LIKE '%T090000Z%'
  AND a.duration_mn = 180
  AND (a.rrule NOT LIKE '%UNTIL=%' OR a.rrule LIKE '%UNTIL=20260112T090000Z%');

-- Create post-mission availability for John Doe (Monday 9am-12pm, starting after mission ends)
WITH mission_info AS (
  SELECT
    m.mission_until,
    m.professional_id
  FROM public.missions m
  WHERE m.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
    AND m.status = 'accepted'
    AND m.title = 'Monday Morning Care'
    AND EXTRACT(HOUR FROM m.mission_dtstart) = 9
  ORDER BY m.mission_dtstart
  LIMIT 1
),
post_mission_start AS (
  -- Find next Monday after mission ends (1 week later at same time - 9am)
  SELECT (DATE(mission_until) + INTERVAL '7 days' + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE AS start_time
  FROM mission_info
)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(start_time, 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=MO;FREQ=WEEKLY',
  180,
  mi.professional_id
FROM post_mission_start pms
CROSS JOIN mission_info mi
WHERE NOT EXISTS (
  SELECT 1 FROM public.availabilities a2
  WHERE a2.user_id = mi.professional_id
    AND a2.rrule LIKE '%BYDAY=MO%'
    AND a2.rrule LIKE '%T090000Z%'
    AND a2.duration_mn = 180
    AND a2.rrule LIKE '%DTSTART:' || TO_CHAR(start_time, 'YYYYMMDD') || '%'
);

-- Professional 011 (Marie Martin) - Tuesday 2pm-6pm accepted mission
WITH mission_info AS (
  SELECT
    m.mission_dtstart,
    m.mission_until,
    m.professional_id
  FROM public.missions m
  WHERE m.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
    AND m.status = 'accepted'
    AND m.title = 'Tuesday Afternoon'
    AND EXTRACT(HOUR FROM m.mission_dtstart) = 14
  ORDER BY m.mission_dtstart
  LIMIT 1
),
until_date AS (
  SELECT (mission_dtstart - INTERVAL '1 second')::TIMESTAMP WITH TIME ZONE AS until_ts
  FROM mission_info
)
UPDATE public.availabilities a
SET rrule = (
  SELECT
    'DTSTART:' || TO_CHAR(until_ts AT TIME ZONE 'UTC', 'YYYYMMDD') || 'T140000Z' || E'\n' ||
    'RRULE:BYDAY=TU;FREQ=WEEKLY;UNTIL=' || TO_CHAR(until_ts AT TIME ZONE 'UTC', 'YYYYMMDD') || 'T' ||
                 TO_CHAR(EXTRACT(HOUR FROM until_ts AT TIME ZONE 'UTC')::INTEGER, 'FM00') ||
                 TO_CHAR(EXTRACT(MINUTE FROM until_ts AT TIME ZONE 'UTC')::INTEGER, 'FM00') ||
                 TO_CHAR(EXTRACT(SECOND FROM until_ts AT TIME ZONE 'UTC')::INTEGER, 'FM00') || 'Z'
  FROM until_date
)
FROM mission_info mi
WHERE a.user_id = mi.professional_id
  AND a.rrule LIKE '%BYDAY=TU%'
  AND a.rrule LIKE '%T140000Z%'
  AND a.duration_mn = 240
  AND (a.rrule NOT LIKE '%UNTIL=%' OR a.rrule LIKE '%UNTIL=20260113T140000Z%');

-- Create post-mission availability for Marie Martin
WITH mission_info AS (
  SELECT
    m.mission_until,
    m.professional_id
  FROM public.missions m
  WHERE m.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
    AND m.status = 'accepted'
    AND m.title = 'Tuesday Afternoon'
    AND EXTRACT(HOUR FROM m.mission_dtstart) = 14
  ORDER BY m.mission_dtstart
  LIMIT 1
),
post_mission_start AS (
  SELECT (DATE(mission_until) + INTERVAL '7 days' + INTERVAL '14 hours')::TIMESTAMP WITH TIME ZONE AS start_time
  FROM mission_info
)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(start_time, 'YYYYMMDD') || 'T140000Z' || E'\n' ||
  'RRULE:BYDAY=TU;FREQ=WEEKLY',
  240,
  mi.professional_id
FROM post_mission_start pms
CROSS JOIN mission_info mi
WHERE NOT EXISTS (
  SELECT 1 FROM public.availabilities a2
  WHERE a2.user_id = mi.professional_id
    AND a2.rrule LIKE '%BYDAY=TU%'
    AND a2.rrule LIKE '%T140000Z%'
    AND a2.duration_mn = 240
    AND a2.rrule LIKE '%DTSTART:' || TO_CHAR(start_time, 'YYYYMMDD') || '%'
);

-- Professional 012 (Pierre Dupont) - Wednesday 9am-12pm accepted mission
WITH mission_info AS (
  SELECT
    m.mission_dtstart,
    m.mission_until,
    m.professional_id
  FROM public.missions m
  WHERE m.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
    AND m.status = 'accepted'
    AND m.title = 'Wednesday Morning'
    AND EXTRACT(HOUR FROM m.mission_dtstart) = 9
  ORDER BY m.mission_dtstart
  LIMIT 1
),
until_date AS (
  SELECT (mission_dtstart - INTERVAL '1 second')::TIMESTAMP WITH TIME ZONE AS until_ts
  FROM mission_info
)
UPDATE public.availabilities a
SET rrule = (
  SELECT
    'DTSTART:' || TO_CHAR(until_ts AT TIME ZONE 'UTC', 'YYYYMMDD') || 'T090000Z' || E'\n' ||
    'RRULE:BYDAY=WE;FREQ=WEEKLY;UNTIL=' || TO_CHAR(until_ts AT TIME ZONE 'UTC', 'YYYYMMDD') || 'T' ||
                 TO_CHAR(EXTRACT(HOUR FROM until_ts AT TIME ZONE 'UTC')::INTEGER, 'FM00') ||
                 TO_CHAR(EXTRACT(MINUTE FROM until_ts AT TIME ZONE 'UTC')::INTEGER, 'FM00') ||
                 TO_CHAR(EXTRACT(SECOND FROM until_ts AT TIME ZONE 'UTC')::INTEGER, 'FM00') || 'Z'
  FROM until_date
)
FROM mission_info mi
WHERE a.user_id = mi.professional_id
  AND a.rrule LIKE '%BYDAY=WE%'
  AND a.rrule LIKE '%T090000Z%'
  AND a.duration_mn = 180
  AND (a.rrule NOT LIKE '%UNTIL=%' OR a.rrule LIKE '%UNTIL=20260107T090000Z%');

-- Create post-mission availability for Pierre Dupont
WITH mission_info AS (
  SELECT
    m.mission_until,
    m.professional_id
  FROM public.missions m
  WHERE m.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
    AND m.status = 'accepted'
    AND m.title = 'Wednesday Morning'
    AND EXTRACT(HOUR FROM m.mission_dtstart) = 9
  ORDER BY m.mission_dtstart
  LIMIT 1
),
post_mission_start AS (
  SELECT (DATE(mission_until) + INTERVAL '7 days' + INTERVAL '9 hours')::TIMESTAMP WITH TIME ZONE AS start_time
  FROM mission_info
)
INSERT INTO public.availabilities (rrule, duration_mn, user_id)
SELECT
  'DTSTART:' || TO_CHAR(start_time, 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:BYDAY=WE;FREQ=WEEKLY',
  180,
  mi.professional_id
FROM post_mission_start pms
CROSS JOIN mission_info mi
WHERE NOT EXISTS (
  SELECT 1 FROM public.availabilities a2
  WHERE a2.user_id = mi.professional_id
    AND a2.rrule LIKE '%BYDAY=WE%'
    AND a2.rrule LIKE '%T090000Z%'
    AND a2.duration_mn = 180
    AND a2.rrule LIKE '%DTSTART:' || TO_CHAR(start_time, 'YYYYMMDD') || '%'
);
