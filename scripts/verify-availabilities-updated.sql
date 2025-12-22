-- Verification script to check if availabilities were updated correctly for accepted missions
-- Run this after seeding to verify the availability updates worked

-- 1. Count accepted missions
SELECT
  'Accepted missions' AS check_type,
  COUNT(*) AS count
FROM public.missions
WHERE status = 'accepted';

-- 2. Check if availabilities have UNTIL dates (should be updated for overlapping ones)
SELECT
  'Availabilities with UNTIL' AS check_type,
  COUNT(*) AS count
FROM public.availabilities
WHERE rrule ~* 'UNTIL=';

-- 3. Check for availabilities that should have been updated (same day as accepted missions)
-- This finds availabilities that match the day pattern of accepted missions
SELECT
  'Potential overlaps (availabilities matching accepted mission days)' AS check_type,
  COUNT(DISTINCT a.id) AS count
FROM public.availabilities a
INNER JOIN public.missions m ON a.user_id = m.professional_id
WHERE m.status = 'accepted'
  AND a.rrule ~* ('BYDAY=' || CASE EXTRACT(DOW FROM m.mission_dtstart)::INTEGER
    WHEN 0 THEN 'SU'
    WHEN 1 THEN 'MO'
    WHEN 2 THEN 'TU'
    WHEN 3 THEN 'WE'
    WHEN 4 THEN 'TH'
    WHEN 5 THEN 'FR'
    WHEN 6 THEN 'SA'
  END);

-- 4. Check if there are availabilities that start after accepted missions end
-- (These would be the new "post-mission" availabilities created)
SELECT
  'Post-mission availabilities (created after missions)' AS check_type,
  COUNT(*) AS count
FROM public.availabilities a
INNER JOIN public.missions m ON a.user_id = m.professional_id
WHERE m.status = 'accepted'
  AND a.rrule ~* 'DTSTART:'
  AND TO_TIMESTAMP(
    substring(a.rrule from 'DTSTART:(\d{8})T(\d{6})Z'),
    'YYYYMMDDHH24MISS'
  ) AT TIME ZONE 'UTC' > m.mission_until;

-- 5. Sample: Show a few accepted missions with their related availabilities
SELECT
  m.id AS mission_id,
  m.title AS mission_title,
  m.mission_dtstart,
  m.mission_until,
  a.id AS availability_id,
  CASE
    WHEN a.rrule ~* 'UNTIL=' THEN 'Has UNTIL (updated)'
    ELSE 'No UNTIL (not updated or no overlap)'
  END AS availability_status,
  substring(a.rrule from 'BYDAY=([^;]+)') AS availability_day
FROM public.missions m
LEFT JOIN public.availabilities a ON a.user_id = m.professional_id
  AND a.rrule ~* ('BYDAY=' || CASE EXTRACT(DOW FROM m.mission_dtstart)::INTEGER
    WHEN 0 THEN 'SU'
    WHEN 1 THEN 'MO'
    WHEN 2 THEN 'TU'
    WHEN 3 THEN 'WE'
    WHEN 4 THEN 'TH'
    WHEN 5 THEN 'FR'
    WHEN 6 THEN 'SA'
  END)
WHERE m.status = 'accepted'
LIMIT 10;

