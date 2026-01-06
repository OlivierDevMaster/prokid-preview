-- Seed: test_availability_mission
-- Purpose: Create a single accepted mission for today to test check_professional_availability RPC
-- Professional: John Doe (08fb0a72-ee9b-4771-bf24-7fe19c869ae2)
-- Structure: contact@structure1.com (08fb0a72-ee9b-4771-bf24-7fe19c869af9)
-- Status: accepted
-- Date: Today (current date)

-- Delete any existing test mission for this professional today to avoid duplicates
DELETE FROM public.missions
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
  AND structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
  AND status = 'accepted'
  AND DATE(mission_dtstart) = CURRENT_DATE
  AND DATE(mission_until) >= CURRENT_DATE;

-- Insert a single accepted mission for today
-- Mission starts at the beginning of today and ends at the end of today
-- This ensures the mission is always active when the seed runs (mission_dtstart <= NOW() <= mission_until)
WITH mission_insert AS (
  INSERT INTO public.missions (
    structure_id,
    professional_id,
    status,
    mission_dtstart,
    mission_until,
    title,
    description
  ) VALUES (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9', -- Structure 1 (contact@structure1.com)
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', -- Professional (John Doe - john.doe@example.com)
    'accepted',
    CURRENT_DATE::TIMESTAMP WITH TIME ZONE, -- Start of today (00:00:00)
    (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMP WITH TIME ZONE, -- End of today (00:00:00 tomorrow)
    'Test Mission - Availability Check',
    'This mission is created for testing the check_professional_availability RPC function. It should return TRUE when checking if the professional is available today.'
  )
  RETURNING id, mission_dtstart
)
-- Insert mission schedule for the test mission
-- Creates a one-time schedule for today (8 hours duration)
INSERT INTO public.mission_schedules (mission_id, rrule, duration_mn)
SELECT
  m.id,
  'DTSTART:' || TO_CHAR(m.mission_dtstart, 'YYYYMMDD') || 'T090000Z' || E'\n' ||
  'RRULE:FREQ=DAILY;COUNT=1',
  480
FROM mission_insert m;

