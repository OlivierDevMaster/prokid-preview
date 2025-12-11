-- Seed: missions
-- Purpose: Create mission entries for professionals who are members of structures
-- Note: Missions now use mission_schedules table with RRULEs constrained by mission dates
-- Note: Structure memberships are created automatically via triggers when structure invitations are accepted
-- Note: This seed file requires structure_invitations seed (07_structure_invitations.sql) and availabilities seed (04_availabilities.sql) to be run first
-- Note: Each professional has 5-10 missions from multiple structures they're members of
-- Note: Most missions are one-time (until_offset = NULL), some are recurring with UNTIL dates
-- Note: Uses seeds_create_mission_from_availability() which finds matching availabilities to extract RRULE patterns, generates constrained RRULEs, and creates schedules (no availability_id stored)
-- Note: Some missions use seeds_create_mission_with_custom_rrule() to test missions outside professional availabilities

-- ============================================================================
-- Professional 010 (John Doe) - Member of structures: af9, afa, afb, afc, afd
-- Availability: Mon 9am-12pm, Mon 2pm-6pm, Tue 8am-12pm, Wed 10am-4pm, Fri 9am-5pm
-- ============================================================================

-- From Structure 1 (af9)
-- Monday 2pm-6pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 1, 14, 240, 0, NULL, 'accepted', 'Monday Afternoon Session', 'Afternoon childcare and activities'
);
  -- Tuesday 8am-12pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 2, 8, 240, 0, NULL, 'pending', 'Tuesday Morning Therapy', 'Morning therapy sessions');
  -- Friday 9am-1pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 5, 9, 240, 0, NULL, 'accepted', 'Friday Morning Care', 'Full morning care session');
  -- Wednesday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 3, 10, 240, 0, NULL, 'declined', 'Wednesday Midday', 'Midday care session');

-- From Structure 2 (afa)
-- Monday 2pm-6pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 1, 14, 240, 1, NULL, 'accepted', 'Second Week Monday Afternoon', 'Follow-up afternoon session');
  -- Wednesday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 3, 10, 240, 1, NULL, 'pending', 'Second Week Wednesday', 'Midday care for second week');
  -- Friday 1pm-5pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 5, 13, 240, 1, NULL, 'accepted', 'Second Week Friday Afternoon', 'Afternoon session');

-- From Structure 3 (afb)
-- Monday 2pm-6pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 1, 14, 240, 2, NULL, 'pending', 'Third Week Monday', 'Third week afternoon session');
  -- Tuesday 8am-12pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 2, 8, 240, 2, NULL, 'cancelled', 'Third Week Tuesday', 'Cancelled morning session');

-- From Structure 4 (afc)
-- Friday 2pm-5pm (180 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 5, 14, 180, 0, NULL, 'accepted', 'Friday Afternoon Care', 'Afternoon care from Structure 4');

-- ============================================================================
-- Professional 011 (Marie Martin) - Member of structures: af9, afa, afe, aff
-- Availability: Mon 8am-1pm, Tue 2pm-6pm, Thu 9am-3pm, Sat 10am-4pm
-- ============================================================================

-- From Structure 1 (af9)
-- Monday 8am-1pm (300 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 1, 8, 300, 0, NULL, 'accepted', 'Monday Full Morning', 'Complete morning care session');
  -- Thursday 9am-12pm (180 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 4, 9, 180, 0, NULL, 'pending', 'Thursday Morning', 'Morning care for toddlers');
  -- Saturday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 6, 10, 240, 0, NULL, 'accepted', 'Saturday Morning Care', 'Weekend care session');

-- From Structure 2 (afa)
-- Tuesday 2pm-6pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 2, 14, 240, 0, NULL, 'accepted', 'Tuesday Afternoon', 'Afternoon care with activities');
  -- Monday 8am-11am (180 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 1, 8, 180, 1, NULL, 'pending', 'Second Week Monday', 'Early morning session');
  -- Thursday 9am-1pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 4, 9, 240, 1, NULL, 'declined', 'Second Week Thursday', 'Declined due to conflict');

-- From Structure 6 (afe)
-- Saturday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 6, 10, 240, 1, NULL, 'accepted', 'Second Week Saturday', 'Weekend care from Structure 6');
  -- Tuesday 2pm-6pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 2, 14, 240, 1, NULL, 'pending', 'Second Week Tuesday', 'Afternoon session');

-- From Structure 7 (aff)
-- Thursday 9am-1pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 4, 9, 240, 2, NULL, 'accepted', 'Third Week Thursday', 'Thursday care from Structure 7');
  -- Monday 8am-12pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 1, 8, 240, 2, NULL, 'cancelled', 'Third Week Monday', 'Cancelled morning session');
  -- Tuesday 2pm-6pm (240 min), one-time, week 0 (for reports seed - Marie Martin)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 2, 14, 240, 0, NULL, 'accepted', 'Tuesday Afternoon Care', 'Tuesday afternoon care session');

-- ============================================================================
-- Professional 012 (Pierre Dupont) - Member of structures: afa, afb, afc, b00
-- Availability: Mon 1pm-5pm, Wed 9am-12pm, Wed 2pm-6pm, Sun 8am-4pm
-- ============================================================================

-- From Structure 2 (afa)
-- Monday 1pm-5pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 1, 13, 240, 0, NULL, 'accepted', 'Monday Afternoon Consultation', 'Afternoon consultation session');
  -- Wednesday 2pm-6pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 3, 14, 240, 0, NULL, 'pending', 'Wednesday Afternoon', 'Afternoon care session');
  -- Sunday 8am-12pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 0, 8, 240, 0, NULL, 'accepted', 'Sunday Morning', 'Sunday morning care');

-- From Structure 3 (afb)
-- Wednesday 9am-12pm (180 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 3, 9, 180, 0, NULL, 'pending', 'Wednesday Morning', 'Morning consultation');
  -- Monday 1pm-5pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 1, 13, 240, 1, NULL, 'declined', 'Second Week Monday', 'Declined afternoon session');
  -- Sunday 10am-2pm (240 min), one-time, week 0 (for reports seed)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 0, 10, 240, 0, NULL, 'accepted', 'Sunday Morning Care', 'Sunday morning care session');

-- From Structure 4 (afc)
-- Sunday 12pm-4pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 0, 12, 240, 1, NULL, 'accepted', 'Second Week Sunday Afternoon', 'Sunday afternoon from Structure 4');
  -- Wednesday 2pm-6pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 3, 14, 240, 1, NULL, 'pending', 'Second Week Wednesday', 'Afternoon session');

-- From Structure 8 (b00)
-- Monday 1pm-5pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 1, 13, 240, 2, NULL, 'accepted', 'Third Week Monday', 'Monday from Structure 8');
  -- Sunday 8am-12pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 0, 8, 240, 2, NULL, 'cancelled', 'Third Week Sunday', 'Cancelled Sunday session');

-- ============================================================================
-- Professional 013 (Sophie Bernard) - Member of structures: afb, afc, afd, afe, b01
-- Availability: Mon 9am-3pm, Tue 10am-4pm, Thu 8am-1pm
-- ============================================================================

-- From Structure 3 (afb)
-- Monday 9am-12pm (180 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 1, 9, 180, 0, NULL, 'accepted', 'Monday Morning Care', 'Morning care for preschool');
  -- Tuesday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 2, 10, 240, 0, NULL, 'pending', 'Tuesday Midday', 'Midday care with lunch');
  -- Thursday 8am-11am (180 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 4, 8, 180, 0, NULL, 'accepted', 'Thursday Early Morning', 'Early morning session');

-- From Structure 4 (afc)
-- Monday 9am-1pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 1, 9, 240, 1, NULL, 'pending', 'Second Week Monday', 'Extended morning session');
  -- Tuesday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 2, 10, 240, 1, NULL, 'declined', 'Second Week Tuesday', 'Declined midday session');
  -- Thursday 8am-12pm (240 min), one-time, week 0 (for reports seed)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 4, 8, 240, 0, NULL, 'accepted', 'Thursday Morning Care', 'Thursday morning care session');
  -- Thursday 1pm-4pm (180 min), one-time, week 0 (for reports seed - Antoine Petit)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 4, 13, 180, 0, NULL, 'accepted', 'Thursday Afternoon Care', 'Thursday afternoon care session');

-- From Structure 5 (afd)
-- Thursday 8am-12pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 4, 8, 240, 1, NULL, 'accepted', 'Second Week Thursday', 'Thursday from Structure 5');
  -- Monday 9am-1pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 1, 9, 240, 2, NULL, 'pending', 'Third Week Monday', 'Monday morning care');
  -- Monday 9am-1pm (240 min), one-time, week 0 (for reports seed - Camille Laurent)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 1, 9, 240, 0, NULL, 'accepted', 'Monday Morning Care', 'Monday morning care session');

-- From Structure 6 (afe)
-- Tuesday 10am-2pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 2, 10, 240, 2, NULL, 'accepted', 'Third Week Tuesday', 'Tuesday from Structure 6');
  -- Thursday 8am-11am (180 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 4, 8, 180, 2, NULL, 'cancelled', 'Third Week Thursday', 'Cancelled early morning');

-- From Structure 9 (b01)
-- Monday 9am-1pm (240 min), one-time, week 3
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 1, 9, 240, 3, NULL, 'pending', 'Fourth Week Monday', 'Monday from Structure 9');

-- ============================================================================
-- Professional 014 (Thomas Leroy) - Member of structures: af9, afd, aff, b00
-- Availability: Tue 2pm-6pm, Wed 9am-5pm, Fri 10am-4pm
-- ============================================================================

-- From Structure 1 (af9)
-- Tuesday 2pm-6pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 2, 14, 240, 0, NULL, 'accepted', 'Tuesday Afternoon Care', 'Afternoon care with outdoor activities');
  -- Friday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 5, 10, 240, 0, NULL, 'pending', 'Friday Midday Session', 'Friday midday care');
  -- Wednesday 9am-1pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 3, 9, 240, 0, NULL, 'accepted', 'Wednesday Morning', 'Full morning session');

-- From Structure 5 (afd)
-- Wednesday 1pm-5pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 3, 13, 240, 1, NULL, 'pending', 'Second Week Wednesday Afternoon', 'Afternoon from Structure 5');
  -- Tuesday 2pm-6pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 2, 14, 240, 1, NULL, 'declined', 'Second Week Tuesday', 'Declined afternoon');
  -- Friday 10am-2pm (240 min), one-time, week 0 (for reports seed - Structure 5)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 5, 10, 240, 0, NULL, 'accepted', 'Friday Midday Care', 'Friday midday care session');

-- From Structure 7 (aff)
-- Friday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 5, 10, 240, 1, NULL, 'accepted', 'Second Week Friday', 'Friday from Structure 7');
  -- Wednesday 9am-1pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 3, 9, 240, 2, NULL, 'cancelled', 'Third Week Wednesday', 'Cancelled morning');

-- From Structure 8 (b00)
-- Tuesday 2pm-6pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 2, 14, 240, 2, NULL, 'pending', 'Third Week Tuesday', 'Tuesday from Structure 8');
  -- Friday 10am-2pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 5, 10, 240, 2, NULL, 'accepted', 'Third Week Friday', 'Friday midday care');
  -- Wednesday 9am-1pm (240 min), one-time, week 0 (for reports seed - Thomas Leroy)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 3, 9, 240, 0, NULL, 'accepted', 'Wednesday Morning Care', 'Wednesday morning care session');

-- ============================================================================
-- Professional 015 (Lucie Moreau) - Member of structures: afa, afb, afe, b01, b02
-- Availability: Mon 8am-12pm, Wed 1pm-6pm, Sat 9am-3pm
-- ============================================================================

-- From Structure 2 (afa)
-- Monday 8am-12pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 1, 8, 240, 0, NULL, 'accepted', 'Monday Morning Session', 'Complete morning care');
  -- Saturday 9am-1pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 6, 9, 240, 0, NULL, 'pending', 'Saturday Morning', 'Saturday morning care');
  -- Wednesday 1pm-4pm (180 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 3, 13, 180, 0, NULL, 'accepted', 'Wednesday Afternoon', 'Afternoon session');

-- From Structure 3 (afb)
-- Monday 8am-12pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 1, 8, 240, 1, NULL, 'pending', 'Second Week Monday', 'Monday from Structure 3');
  -- Wednesday 1pm-6pm (300 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 3, 13, 300, 1, NULL, 'declined', 'Second Week Wednesday', 'Declined full afternoon');

-- From Structure 6 (afe)
-- Saturday 9am-1pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 6, 9, 240, 1, NULL, 'accepted', 'Second Week Saturday', 'Saturday from Structure 6');
  -- Wednesday 1pm-5pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 3, 13, 240, 2, NULL, 'pending', 'Third Week Wednesday', 'Afternoon session');
  -- Wednesday 1pm-5pm (240 min), one-time, week 0 (for reports seed - Nicolas Garcia)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 3, 13, 240, 0, NULL, 'accepted', 'Wednesday Afternoon Care', 'Wednesday afternoon care session');

-- From Structure 9 (b01)
-- Monday 8am-12pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 1, 8, 240, 2, NULL, 'accepted', 'Third Week Monday', 'Monday from Structure 9');
  -- Saturday 9am-1pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 6, 9, 240, 2, NULL, 'cancelled', 'Third Week Saturday', 'Cancelled Saturday');
  -- Wednesday 1pm-5pm (240 min), one-time, week 0 (for reports seed - Lucie Moreau)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 3, 13, 240, 0, NULL, 'accepted', 'Wednesday Afternoon Care', 'Wednesday afternoon care session');

-- From Structure 10 (b02)
-- Wednesday 1pm-5pm (240 min), one-time, week 3
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 3, 13, 240, 3, NULL, 'pending', 'Fourth Week Wednesday', 'Wednesday from Structure 10');
  -- Monday 8am-12pm (240 min), one-time, week 0 (for reports seed - Lucie Moreau)
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 1, 8, 240, 0, NULL, 'accepted', 'Monday Morning Care', 'Monday morning care session');

-- ============================================================================
-- Professional 016 (Antoine Petit) - Member of structures: af9, afc, aff, b00, b02
-- Availability: Tue 10am-2pm, Thu 8am-4pm, Fri 11am-5pm
-- ============================================================================

-- From Structure 1 (af9)
-- Tuesday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 2, 10, 240, 0, NULL, 'pending', 'Tuesday Midday Care', 'Midday care with educational activities');
  -- Thursday 8am-12pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 4, 8, 240, 0, NULL, 'accepted', 'Thursday Morning Session', 'Morning care for infants');
  -- Friday 11am-3pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 5, 11, 240, 0, NULL, 'accepted', 'Friday Midday', 'Friday midday session');

-- From Structure 4 (afc)
-- Thursday 12pm-4pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 4, 12, 240, 1, NULL, 'accepted', 'Second Week Thursday Afternoon', 'Afternoon from Structure 4');
  -- Tuesday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 2, 10, 240, 1, NULL, 'pending', 'Second Week Tuesday', 'Tuesday midday');
  -- Friday 11am-3pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 5, 11, 240, 1, NULL, 'declined', 'Second Week Friday', 'Declined Friday session');

-- From Structure 7 (aff)
-- Thursday 8am-12pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 4, 8, 240, 2, NULL, 'accepted', 'Third Week Thursday Morning', 'Morning from Structure 7');
  -- Friday 11am-3pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 5, 11, 240, 2, NULL, 'cancelled', 'Third Week Friday', 'Cancelled Friday');

-- From Structure 8 (b00)
-- Tuesday 10am-2pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 2, 10, 240, 2, NULL, 'pending', 'Third Week Tuesday', 'Tuesday from Structure 8');

-- From Structure 10 (b02)
-- Thursday 8am-12pm (240 min), one-time, week 3
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 4, 8, 240, 3, NULL, 'accepted', 'Fourth Week Thursday', 'Thursday from Structure 10');
  -- Friday 11am-3pm (240 min), one-time, week 3
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 5, 11, 240, 3, NULL, 'pending', 'Fourth Week Friday', 'Friday midday care');

-- ============================================================================
-- Professional 017 (Camille Laurent) - Member of structures: afa, afd, afe, b01
-- Availability: Mon 9am-1pm, Tue 2pm-6pm, Thu 8am-12pm, Sun 10am-4pm
-- ============================================================================

-- From Structure 2 (afa)
-- Monday 9am-1pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 1, 9, 240, 0, NULL, 'accepted', 'Monday Morning Care', 'Morning care session');
  -- Tuesday 2pm-6pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 2, 14, 240, 0, NULL, 'pending', 'Tuesday Afternoon', 'Afternoon care');
  -- Thursday 8am-12pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 4, 8, 240, 0, NULL, 'accepted', 'Thursday Morning', 'Thursday morning session');
  -- Sunday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 0, 10, 240, 0, NULL, 'pending', 'Sunday Morning', 'Sunday morning care');

-- From Structure 5 (afd)
-- Monday 9am-1pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 1, 9, 240, 1, NULL, 'accepted', 'Second Week Monday', 'Monday from Structure 5');
  -- Tuesday 2pm-6pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 2, 14, 240, 1, NULL, 'declined', 'Second Week Tuesday', 'Declined afternoon');

-- From Structure 6 (afe)
-- Thursday 8am-12pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 4, 8, 240, 1, NULL, 'pending', 'Second Week Thursday', 'Thursday from Structure 6');
  -- Sunday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 0, 10, 240, 1, NULL, 'accepted', 'Second Week Sunday', 'Sunday from Structure 6');

-- From Structure 9 (b01)
-- Monday 9am-1pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 1, 9, 240, 2, NULL, 'accepted', 'Third Week Monday', 'Monday from Structure 9');
  -- Sunday 10am-2pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 0, 10, 240, 2, NULL, 'cancelled', 'Third Week Sunday', 'Cancelled Sunday');

-- ============================================================================
-- Professional 018 (Julien Simon) - Member of structures: afb, afc, aff, b00, b02
-- Availability: Mon 1pm-5pm, Wed 9am-3pm, Fri 10am-4pm
-- ============================================================================

-- From Structure 3 (afb)
-- Monday 1pm-5pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 1, 13, 240, 0, NULL, 'accepted', 'Monday Afternoon Consultation', 'Afternoon consultation');
  -- Wednesday 9am-1pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 3, 9, 240, 0, NULL, 'pending', 'Wednesday Morning', 'Morning care session');
  -- Friday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 5, 10, 240, 0, NULL, 'accepted', 'Friday Midday', 'Friday midday care');

-- From Structure 4 (afc)
-- Monday 1pm-5pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 1, 13, 240, 1, NULL, 'pending', 'Second Week Monday', 'Monday from Structure 4');
  -- Wednesday 9am-1pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 3, 9, 240, 1, NULL, 'declined', 'Second Week Wednesday', 'Declined morning');

-- From Structure 7 (aff)
-- Friday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 5, 10, 240, 1, NULL, 'accepted', 'Second Week Friday', 'Friday from Structure 7');
  -- Wednesday 9am-1pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 3, 9, 240, 2, NULL, 'pending', 'Third Week Wednesday', 'Wednesday morning');

-- From Structure 8 (b00)
-- Monday 1pm-5pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 1, 13, 240, 2, NULL, 'accepted', 'Third Week Monday', 'Monday from Structure 8');
  -- Friday 10am-2pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 5, 10, 240, 2, NULL, 'cancelled', 'Third Week Friday', 'Cancelled Friday');

-- From Structure 10 (b02)
-- Wednesday 9am-1pm (240 min), one-time, week 3
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 3, 9, 240, 3, NULL, 'pending', 'Fourth Week Wednesday', 'Wednesday from Structure 10');
  -- Friday 10am-2pm (240 min), one-time, week 3
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 5, 10, 240, 3, NULL, 'accepted', 'Fourth Week Friday', 'Friday midday care');

-- ============================================================================
-- Professional 019 (Emilie Michel) - Member of structures: af9, afa, afd, b01
-- Availability: Tue 8am-1pm, Thu 2pm-6pm, Sat 9am-5pm
-- ============================================================================

-- From Structure 1 (af9)
-- Tuesday 8am-1pm (300 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 2, 8, 300, 0, NULL, 'accepted', 'Tuesday Full Morning', 'Complete morning care');
  -- Thursday 2pm-6pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 4, 14, 240, 0, NULL, 'pending', 'Thursday Afternoon', 'Afternoon care session');
  -- Saturday 9am-1pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 6, 9, 240, 0, NULL, 'accepted', 'Saturday Morning', 'Saturday morning care');

-- From Structure 2 (afa)
-- Tuesday 8am-12pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 2, 8, 240, 1, NULL, 'pending', 'Second Week Tuesday', 'Tuesday morning from Structure 2');
  -- Thursday 2pm-6pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 4, 14, 240, 1, NULL, 'declined', 'Second Week Thursday', 'Declined afternoon');

-- From Structure 5 (afd)
-- Saturday 1pm-5pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 6, 13, 240, 1, NULL, 'accepted', 'Second Week Saturday Afternoon', 'Saturday afternoon from Structure 5');
  -- Tuesday 8am-1pm (300 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 2, 8, 300, 2, NULL, 'pending', 'Third Week Tuesday', 'Tuesday from Structure 5');

-- From Structure 9 (b01)
-- Thursday 2pm-6pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 4, 14, 240, 2, NULL, 'accepted', 'Third Week Thursday', 'Thursday from Structure 9');
  -- Saturday 9am-1pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 6, 9, 240, 2, NULL, 'cancelled', 'Third Week Saturday', 'Cancelled Saturday morning');

-- ============================================================================
-- Professional 01a (Nicolas Garcia) - Member of structures: afb, afe, aff, b00, b02
-- Availability: Mon 10am-2pm, Wed 8am-12pm, Fri 1pm-5pm
-- ============================================================================

-- From Structure 3 (afb)
-- Monday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 1, 10, 240, 0, NULL, 'accepted', 'Monday Midday Care', 'Midday care session');
  -- Wednesday 8am-12pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 3, 8, 240, 0, NULL, 'pending', 'Wednesday Morning', 'Morning care');
  -- Friday 1pm-5pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 5, 13, 240, 0, NULL, 'accepted', 'Friday Afternoon', 'Friday afternoon care');

-- From Structure 6 (afe)
-- Monday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 1, 10, 240, 1, NULL, 'pending', 'Second Week Monday', 'Monday from Structure 6');
  -- Wednesday 8am-12pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 3, 8, 240, 1, NULL, 'declined', 'Second Week Wednesday', 'Declined morning');

-- From Structure 7 (aff)
-- Friday 1pm-5pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 5, 13, 240, 1, NULL, 'accepted', 'Second Week Friday', 'Friday from Structure 7');
  -- Monday 10am-2pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 1, 10, 240, 2, NULL, 'pending', 'Third Week Monday', 'Monday midday');

-- From Structure 8 (b00)
-- Wednesday 8am-12pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 3, 8, 240, 2, NULL, 'accepted', 'Third Week Wednesday', 'Wednesday from Structure 8');
  -- Friday 1pm-5pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 5, 13, 240, 2, NULL, 'cancelled', 'Third Week Friday', 'Cancelled Friday');

-- From Structure 10 (b02)
-- Monday 10am-2pm (240 min), one-time, week 3
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 1, 10, 240, 3, NULL, 'pending', 'Fourth Week Monday', 'Monday from Structure 10');
  -- Friday 1pm-5pm (240 min), one-time, week 3
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 5, 13, 240, 3, NULL, 'accepted', 'Fourth Week Friday', 'Friday afternoon care');

-- ============================================================================
-- Professional 01b (aed) - Member of structures: af9, afc, afd, b01
-- Availability: Typical weekday hours (using common patterns)
-- ============================================================================

-- From Structure 1 (af9)
-- Monday 9am-1pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 1, 9, 240, 0, NULL, 'accepted', 'Monday Morning Care', 'Morning care session');
  -- Wednesday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 3, 10, 240, 0, NULL, 'pending', 'Wednesday Midday', 'Midday care');
  -- Friday 11am-3pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 5, 11, 240, 0, NULL, 'accepted', 'Friday Midday', 'Friday midday session');
  -- Tuesday 8am-12pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 2, 8, 240, 0, NULL, 'pending', 'Tuesday Morning', 'Tuesday morning care');

-- From Structure 4 (afc)
-- Monday 9am-1pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 1, 9, 240, 1, NULL, 'pending', 'Second Week Monday', 'Monday from Structure 4');
  -- Wednesday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 3, 10, 240, 1, NULL, 'declined', 'Second Week Wednesday', 'Declined midday');

-- From Structure 5 (afd)
-- Friday 11am-3pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 5, 11, 240, 1, NULL, 'accepted', 'Second Week Friday', 'Friday from Structure 5');
  -- Monday 9am-1pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 1, 9, 240, 2, NULL, 'pending', 'Third Week Monday', 'Monday morning care');

-- From Structure 9 (b01)
-- Wednesday 10am-2pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 3, 10, 240, 2, NULL, 'accepted', 'Third Week Wednesday', 'Wednesday from Structure 9');
  -- Friday 11am-3pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 5, 11, 240, 2, NULL, 'cancelled', 'Third Week Friday', 'Cancelled Friday');

-- ============================================================================
-- Professional 01c (aee) - Member of structures: afa, afb, afe, b02
-- Availability: Typical weekday hours (using common patterns)
-- ============================================================================

-- From Structure 2 (afa)
-- Tuesday 9am-1pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 2, 9, 240, 0, NULL, 'accepted', 'Tuesday Morning Care', 'Morning care session');
  -- Thursday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 4, 10, 240, 0, NULL, 'pending', 'Thursday Midday', 'Midday care');
  -- Saturday 8am-12pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 6, 8, 240, 0, NULL, 'accepted', 'Saturday Morning', 'Saturday morning care');
  -- Monday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 1, 10, 240, 0, NULL, 'pending', 'Monday Midday', 'Monday midday session');

-- From Structure 3 (afb)
-- Tuesday 9am-1pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 2, 9, 240, 1, NULL, 'pending', 'Second Week Tuesday', 'Tuesday from Structure 3');
  -- Thursday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 4, 10, 240, 1, NULL, 'declined', 'Second Week Thursday', 'Declined midday');

-- From Structure 6 (afe)
-- Saturday 8am-12pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 6, 8, 240, 1, NULL, 'accepted', 'Second Week Saturday', 'Saturday from Structure 6');
  -- Tuesday 9am-1pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 2, 9, 240, 2, NULL, 'pending', 'Third Week Tuesday', 'Tuesday morning care');

-- From Structure 10 (b02)
-- Thursday 10am-2pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 4, 10, 240, 2, NULL, 'accepted', 'Third Week Thursday', 'Thursday from Structure 10');
  -- Saturday 8am-12pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 6, 8, 240, 2, NULL, 'cancelled', 'Third Week Saturday', 'Cancelled Saturday');

-- ============================================================================
-- Professional 01d (aef) - Member of structures: afc, afd, aff, b00, b01
-- Availability: Typical weekday hours (using common patterns)
-- ============================================================================

-- From Structure 4 (afc)
-- Monday 8am-12pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 1, 8, 240, 0, NULL, 'accepted', 'Monday Morning Care', 'Morning care session');
  -- Wednesday 9am-1pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 3, 9, 240, 0, NULL, 'pending', 'Wednesday Morning', 'Morning care');
  -- Friday 10am-2pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 5, 10, 240, 0, NULL, 'accepted', 'Friday Midday', 'Friday midday care');
  -- Tuesday 2pm-6pm (240 min), one-time, week 0
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 2, 14, 240, 0, NULL, 'pending', 'Tuesday Afternoon', 'Tuesday afternoon care');

-- From Structure 5 (afd)
-- Monday 8am-12pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 1, 8, 240, 1, NULL, 'pending', 'Second Week Monday', 'Monday from Structure 5');
  -- Wednesday 9am-1pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 3, 9, 240, 1, NULL, 'declined', 'Second Week Wednesday', 'Declined morning');

-- From Structure 7 (aff)
-- Friday 10am-2pm (240 min), one-time, week 1
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 5, 10, 240, 1, NULL, 'accepted', 'Second Week Friday', 'Friday from Structure 7');
  -- Monday 8am-12pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 1, 8, 240, 2, NULL, 'pending', 'Third Week Monday', 'Monday morning care');

-- From Structure 8 (b00)
-- Wednesday 9am-1pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 3, 9, 240, 2, NULL, 'accepted', 'Third Week Wednesday', 'Wednesday from Structure 8');
  -- Friday 10am-2pm (240 min), one-time, week 2
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 5, 10, 240, 2, NULL, 'cancelled', 'Third Week Friday', 'Cancelled Friday');

-- From Structure 9 (b01)
-- Monday 8am-12pm (240 min), one-time, week 3
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 1, 8, 240, 3, NULL, 'pending', 'Fourth Week Monday', 'Monday from Structure 9');
  -- Friday 10am-2pm (240 min), one-time, week 3
SELECT public.seeds_create_mission_from_availability(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 5, 10, 240, 3, NULL, 'accepted', 'Fourth Week Friday', 'Friday midday care');

-- ============================================================================
-- TEST CASES: Missions outside professional availabilities
-- These test the new architecture where structures can create missions
-- with custom RRULEs that don't match professional availabilities
-- ============================================================================

-- Professional 010 (John Doe) - Has: Mon 9am-12pm, Mon 2pm-6pm, Tue 8am-12pm, Wed 10am-4pm, Fri 9am-5pm
-- Testing: Thursday (no availability), Monday 7am (before availability), Monday 7pm (after availability)

-- From Structure 1 (af9) - Thursday 10am-2pm (outside availability - John doesn't work Thursdays)
SELECT public.seeds_create_mission_with_custom_rrule(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 4, 10, 240, 0, NULL, 'pending', 'Thursday Custom Session', 'Mission outside availability - Thursday'
);

-- From Structure 2 (afa) - Monday 7am-9am (before availability - John starts at 9am)
SELECT public.seeds_create_mission_with_custom_rrule(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 1, 7, 120, 0, NULL, 'pending', 'Early Monday Session', 'Mission outside availability - Early morning'
);

-- From Structure 3 (afb) - Monday 7pm-9pm (after availability - John ends at 6pm)
SELECT public.seeds_create_mission_with_custom_rrule(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 1, 19, 120, 0, NULL, 'pending', 'Evening Monday Session', 'Mission outside availability - Evening'
);

-- Professional 011 (Marie Martin) - Has: Mon 8am-1pm, Tue 2pm-6pm, Thu 9am-3pm, Sat 10am-4pm
-- Testing: Wednesday (no availability), Sunday (no availability)

-- From Structure 1 (af9) - Wednesday 11am-3pm (outside availability - Marie doesn't work Wednesdays)
SELECT public.seeds_create_mission_with_custom_rrule(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 3, 11, 240, 0, NULL, 'pending', 'Wednesday Custom Care', 'Mission outside availability - Wednesday'
);

-- From Structure 2 (afa) - Sunday 2pm-6pm (outside availability - Marie doesn't work Sundays)
SELECT public.seeds_create_mission_with_custom_rrule(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 0, 14, 240, 0, NULL, 'pending', 'Sunday Custom Session', 'Mission outside availability - Sunday'
);

-- Professional 012 (Pierre Dupont) - Has: Mon 1pm-5pm, Wed 9am-12pm, Wed 2pm-6pm, Sun 8am-4pm
-- Testing: Tuesday (no availability), Friday (no availability)

-- From Structure 2 (afa) - Tuesday 10am-2pm (outside availability - Pierre doesn't work Tuesdays)
SELECT public.seeds_create_mission_with_custom_rrule(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 2, 10, 240, 0, NULL, 'pending', 'Tuesday Custom Consultation', 'Mission outside availability - Tuesday'
);

-- From Structure 3 (afb) - Friday 1pm-5pm (outside availability - Pierre doesn't work Fridays)
SELECT public.seeds_create_mission_with_custom_rrule(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 5, 13, 240, 0, NULL, 'pending', 'Friday Custom Session', 'Mission outside availability - Friday'
);

-- Note: seeds_get_next_weekday function is kept for potential future use
