-- Seed: missions
-- Purpose: Create mission entries for professionals who are members of structures
-- Note: Missions now use mission_schedules table with RRULEs constrained by mission dates
-- Note: Structure memberships are created automatically via triggers when structure invitations are accepted
-- Note: This seed file requires structure_invitations seed (08_structure_invitations.sql) and availabilities seed (05_availabilities.sql) to be run first
-- Note: Reduced to ~40 missions for 5 professionals to avoid overlaps
-- Note: Uses seeds_create_mission_from_availability() which finds matching availabilities to extract RRULE patterns, generates constrained RRULEs, and creates schedules

-- ============================================================================
-- Professional 010 (John Doe) - Member of structures: af9, afa
-- Availability: Mon 9am-12pm, Mon 2pm-6pm, Wed 10am-4pm
-- ============================================================================

-- From Structure 1 (af9)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 1, 14, 240, 0, NULL, 'pending', 'Monday Afternoon Session', 'Afternoon childcare and activities'
);
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 3, 10, 240, 0, NULL, 'pending', 'Wednesday Morning', 'Morning care session'
);

-- From Structure 2 (afa)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 1, 9, 180, 0, NULL, 'pending', 'Monday Morning Care', 'Morning therapy sessions'
);
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 3, 10, 240, 1, NULL, 'pending', 'Second Week Wednesday', 'Midday care for second week'
);

-- ============================================================================
-- Professional 011 (Marie Martin) - Member of structures: af9, afb
-- Availability: Mon 8am-1pm, Tue 2pm-6pm, Thu 9am-3pm
-- ============================================================================

-- From Structure 1 (af9)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 1, 8, 300, 0, NULL, 'pending', 'Monday Full Morning', 'Complete morning care session'
);
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 4, 9, 240, 0, NULL, 'pending', 'Thursday Morning', 'Morning care for toddlers'
);

-- From Structure 3 (afb)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 2, 14, 240, 0, NULL, 'pending', 'Tuesday Afternoon', 'Afternoon care with activities'
);
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 1, 8, 240, 1, NULL, 'pending', 'Second Week Monday', 'Early morning session'
);

-- ============================================================================
-- Professional 012 (Pierre Dupont) - Member of structures: afa, afc
-- Availability: Mon 1pm-5pm, Wed 9am-12pm, Wed 2pm-6pm
-- ============================================================================

-- From Structure 2 (afa)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 1, 13, 240, 0, NULL, 'pending', 'Monday Afternoon Consultation', 'Afternoon consultation session'
);
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 3, 14, 240, 0, NULL, 'pending', 'Wednesday Afternoon', 'Afternoon care session'
);

-- From Structure 4 (afc)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 3, 9, 180, 0, NULL, 'pending', 'Wednesday Morning', 'Morning consultation'
);
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 1, 13, 240, 1, NULL, 'pending', 'Second Week Monday', 'Monday afternoon from Structure 4'
);

-- ============================================================================
-- Professional 013 (Sophie Bernard) - Member of structures: afb, afc, afd
-- Availability: Mon 9am-3pm, Tue 10am-4pm, Thu 8am-1pm
-- ============================================================================

-- From Structure 3 (afb)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 1, 9, 180, 0, NULL, 'pending', 'Monday Morning Care', 'Morning care for preschool'
);
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 2, 10, 240, 0, NULL, 'pending', 'Tuesday Midday', 'Midday care with lunch'
);

-- From Structure 4 (afc)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 4, 8, 240, 0, NULL, 'pending', 'Thursday Morning Care', 'Thursday morning care session'
);
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 1, 9, 240, 1, NULL, 'pending', 'Second Week Monday', 'Extended morning session'
);

-- From Structure 5 (afd)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 2, 10, 240, 1, NULL, 'pending', 'Second Week Tuesday', 'Tuesday from Structure 5'
);

-- ============================================================================
-- Professional 014 (Thomas Leroy) - Member of structure: afd
-- Availability: Tue 2pm-6pm, Wed 9am-5pm, Fri 10am-4pm
-- ============================================================================

-- From Structure 5 (afd)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 2, 14, 240, 0, NULL, 'pending', 'Tuesday Afternoon Care', 'Afternoon care with outdoor activities'
);
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 3, 9, 240, 0, NULL, 'pending', 'Wednesday Morning', 'Full morning session'
);
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 5, 10, 240, 0, NULL, 'pending', 'Friday Midday Session', 'Friday midday care'
);
