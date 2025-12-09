-- Seed: missions
-- Purpose: Create mission entries for professionals who are members of structures
-- Note: Missions use RRULE format (RFC 5545) for recurring or one-time missions
-- Note: Structure memberships are created automatically via triggers when structure invitations are accepted
-- Note: This seed file requires structure_invitations seed (07_structure_invitations.sql) to be run first
-- Note: Each professional has 5-10 missions from multiple structures they're members of
-- Note: Most missions are one-time (until_offset = NULL), some are recurring with UNTIL dates

-- ============================================================================
-- Professional 010 (John Doe) - Member of structures: af9, afa, afb, afc, afd
-- Availability: Mon 9am-12pm, Mon 2pm-6pm, Tue 8am-12pm, Wed 10am-4pm, Fri 9am-5pm
-- ============================================================================

-- From Structure 1 (af9)
-- Monday 2pm-6pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'accepted', public.create_mission_rrule(1, 14, 240, 0, NULL), 240, 'Monday Afternoon Session', 'Afternoon childcare and activities'),
  -- Tuesday 8am-12pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending', public.create_mission_rrule(2, 8, 240, 0, NULL), 240, 'Tuesday Morning Therapy', 'Morning therapy sessions'),
  -- Friday 9am-1pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'accepted', public.create_mission_rrule(5, 9, 240, 0, NULL), 240, 'Friday Morning Care', 'Full morning care session'),
  -- Wednesday 10am-2pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'declined', public.create_mission_rrule(3, 10, 240, 0, NULL), 240, 'Wednesday Midday', 'Midday care session');

-- From Structure 2 (afa)
-- Monday 2pm-6pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'accepted', public.create_mission_rrule(1, 14, 240, 1, NULL), 240, 'Second Week Monday Afternoon', 'Follow-up afternoon session'),
  -- Wednesday 10am-2pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending', public.create_mission_rrule(3, 10, 240, 1, NULL), 240, 'Second Week Wednesday', 'Midday care for second week'),
  -- Friday 1pm-5pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'accepted', public.create_mission_rrule(5, 13, 240, 1, NULL), 240, 'Second Week Friday Afternoon', 'Afternoon session');

-- From Structure 3 (afb)
-- Monday 2pm-6pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending', public.create_mission_rrule(1, 14, 240, 2, NULL), 240, 'Third Week Monday', 'Third week afternoon session'),
  -- Tuesday 8am-12pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'cancelled', public.create_mission_rrule(2, 8, 240, 2, NULL), 240, 'Third Week Tuesday', 'Cancelled morning session');

-- From Structure 4 (afc)
-- Friday 2pm-5pm (180 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'accepted', public.create_mission_rrule(5, 14, 180, 0, NULL), 180, 'Friday Afternoon Care', 'Afternoon care from Structure 4');

-- ============================================================================
-- Professional 011 (Marie Martin) - Member of structures: af9, afa, afe, aff
-- Availability: Mon 8am-1pm, Tue 2pm-6pm, Thu 9am-3pm, Sat 10am-4pm
-- ============================================================================

-- From Structure 1 (af9)
-- Monday 8am-1pm (300 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'accepted', public.create_mission_rrule(1, 8, 300, 0, NULL), 300, 'Monday Full Morning', 'Complete morning care session'),
  -- Thursday 9am-12pm (180 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending', public.create_mission_rrule(4, 9, 180, 0, NULL), 180, 'Thursday Morning', 'Morning care for toddlers'),
  -- Saturday 10am-2pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'accepted', public.create_mission_rrule(6, 10, 240, 0, NULL), 240, 'Saturday Morning Care', 'Weekend care session');

-- From Structure 2 (afa)
-- Tuesday 2pm-6pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'accepted', public.create_mission_rrule(2, 14, 240, 0, NULL), 240, 'Tuesday Afternoon', 'Afternoon care with activities'),
  -- Monday 8am-11am (180 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending', public.create_mission_rrule(1, 8, 180, 1, NULL), 180, 'Second Week Monday', 'Early morning session'),
  -- Thursday 9am-1pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'declined', public.create_mission_rrule(4, 9, 240, 1, NULL), 240, 'Second Week Thursday', 'Declined due to conflict');

-- From Structure 6 (afe)
-- Saturday 10am-2pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'accepted', public.create_mission_rrule(6, 10, 240, 1, NULL), 240, 'Second Week Saturday', 'Weekend care from Structure 6'),
  -- Tuesday 2pm-6pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending', public.create_mission_rrule(2, 14, 240, 1, NULL), 240, 'Second Week Tuesday', 'Afternoon session');

-- From Structure 7 (aff)
-- Thursday 9am-1pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'accepted', public.create_mission_rrule(4, 9, 240, 2, NULL), 240, 'Third Week Thursday', 'Thursday care from Structure 7'),
  -- Monday 8am-12pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'cancelled', public.create_mission_rrule(1, 8, 240, 2, NULL), 240, 'Third Week Monday', 'Cancelled morning session'),
  -- Tuesday 2pm-6pm (240 min), one-time, week 0 (for reports seed - Marie Martin)
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'accepted', public.create_mission_rrule(2, 14, 240, 0, NULL), 240, 'Tuesday Afternoon Care', 'Tuesday afternoon care session');

-- ============================================================================
-- Professional 012 (Pierre Dupont) - Member of structures: afa, afb, afc, b00
-- Availability: Mon 1pm-5pm, Wed 9am-12pm, Wed 2pm-6pm, Sun 8am-4pm
-- ============================================================================

-- From Structure 2 (afa)
-- Monday 1pm-5pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'accepted', public.create_mission_rrule(1, 13, 240, 0, NULL), 240, 'Monday Afternoon Consultation', 'Afternoon consultation session'),
  -- Wednesday 2pm-6pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending', public.create_mission_rrule(3, 14, 240, 0, NULL), 240, 'Wednesday Afternoon', 'Afternoon care session'),
  -- Sunday 8am-12pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'accepted', public.create_mission_rrule(0, 8, 240, 0, NULL), 240, 'Sunday Morning', 'Sunday morning care');

-- From Structure 3 (afb)
-- Wednesday 9am-12pm (180 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending', public.create_mission_rrule(3, 9, 180, 0, NULL), 180, 'Wednesday Morning', 'Morning consultation'),
  -- Monday 1pm-5pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'declined', public.create_mission_rrule(1, 13, 240, 1, NULL), 240, 'Second Week Monday', 'Declined afternoon session'),
  -- Sunday 10am-2pm (240 min), one-time, week 0 (for reports seed)
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'accepted', public.create_mission_rrule(0, 10, 240, 0, NULL), 240, 'Sunday Morning Care', 'Sunday morning care session');

-- From Structure 4 (afc)
-- Sunday 12pm-4pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'accepted', public.create_mission_rrule(0, 12, 240, 1, NULL), 240, 'Second Week Sunday Afternoon', 'Sunday afternoon from Structure 4'),
  -- Wednesday 2pm-6pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending', public.create_mission_rrule(3, 14, 240, 1, NULL), 240, 'Second Week Wednesday', 'Afternoon session');

-- From Structure 8 (b00)
-- Monday 1pm-5pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'accepted', public.create_mission_rrule(1, 13, 240, 2, NULL), 240, 'Third Week Monday', 'Monday from Structure 8'),
  -- Sunday 8am-12pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'cancelled', public.create_mission_rrule(0, 8, 240, 2, NULL), 240, 'Third Week Sunday', 'Cancelled Sunday session');

-- ============================================================================
-- Professional 013 (Sophie Bernard) - Member of structures: afb, afc, afd, afe, b01
-- Availability: Mon 9am-3pm, Tue 10am-4pm, Thu 8am-1pm
-- ============================================================================

-- From Structure 3 (afb)
-- Monday 9am-12pm (180 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'accepted', public.create_mission_rrule(1, 9, 180, 0, NULL), 180, 'Monday Morning Care', 'Morning care for preschool'),
  -- Tuesday 10am-2pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending', public.create_mission_rrule(2, 10, 240, 0, NULL), 240, 'Tuesday Midday', 'Midday care with lunch'),
  -- Thursday 8am-11am (180 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'accepted', public.create_mission_rrule(4, 8, 180, 0, NULL), 180, 'Thursday Early Morning', 'Early morning session');

-- From Structure 4 (afc)
-- Monday 9am-1pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending', public.create_mission_rrule(1, 9, 240, 1, NULL), 240, 'Second Week Monday', 'Extended morning session'),
  -- Tuesday 10am-2pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'declined', public.create_mission_rrule(2, 10, 240, 1, NULL), 240, 'Second Week Tuesday', 'Declined midday session'),
  -- Thursday 8am-12pm (240 min), one-time, week 0 (for reports seed)
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'accepted', public.create_mission_rrule(4, 8, 240, 0, NULL), 240, 'Thursday Morning Care', 'Thursday morning care session'),
  -- Thursday 1pm-4pm (180 min), one-time, week 0 (for reports seed - Antoine Petit)
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'accepted', public.create_mission_rrule(4, 13, 180, 0, NULL), 180, 'Thursday Afternoon Care', 'Thursday afternoon care session');

-- From Structure 5 (afd)
-- Thursday 8am-12pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'accepted', public.create_mission_rrule(4, 8, 240, 1, NULL), 240, 'Second Week Thursday', 'Thursday from Structure 5'),
  -- Monday 9am-1pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending', public.create_mission_rrule(1, 9, 240, 2, NULL), 240, 'Third Week Monday', 'Monday morning care'),
  -- Monday 9am-1pm (240 min), one-time, week 0 (for reports seed - Camille Laurent)
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'accepted', public.create_mission_rrule(1, 9, 240, 0, NULL), 240, 'Monday Morning Care', 'Monday morning care session');

-- From Structure 6 (afe)
-- Tuesday 10am-2pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'accepted', public.create_mission_rrule(2, 10, 240, 2, NULL), 240, 'Third Week Tuesday', 'Tuesday from Structure 6'),
  -- Thursday 8am-11am (180 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'cancelled', public.create_mission_rrule(4, 8, 180, 2, NULL), 180, 'Third Week Thursday', 'Cancelled early morning');

-- From Structure 9 (b01)
-- Monday 9am-1pm (240 min), one-time, week 3
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending', public.create_mission_rrule(1, 9, 240, 3, NULL), 240, 'Fourth Week Monday', 'Monday from Structure 9');

-- ============================================================================
-- Professional 014 (Thomas Leroy) - Member of structures: af9, afd, aff, b00
-- Availability: Tue 2pm-6pm, Wed 9am-5pm, Fri 10am-4pm
-- ============================================================================

-- From Structure 1 (af9)
-- Tuesday 2pm-6pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'accepted', public.create_mission_rrule(2, 14, 240, 0, NULL), 240, 'Tuesday Afternoon Care', 'Afternoon care with outdoor activities'),
  -- Friday 10am-2pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending', public.create_mission_rrule(5, 10, 240, 0, NULL), 240, 'Friday Midday Session', 'Friday midday care'),
  -- Wednesday 9am-1pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'accepted', public.create_mission_rrule(3, 9, 240, 0, NULL), 240, 'Wednesday Morning', 'Full morning session');

-- From Structure 5 (afd)
-- Wednesday 1pm-5pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending', public.create_mission_rrule(3, 13, 240, 1, NULL), 240, 'Second Week Wednesday Afternoon', 'Afternoon from Structure 5'),
  -- Tuesday 2pm-6pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'declined', public.create_mission_rrule(2, 14, 240, 1, NULL), 240, 'Second Week Tuesday', 'Declined afternoon'),
  -- Friday 10am-2pm (240 min), one-time, week 0 (for reports seed - Structure 5)
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'accepted', public.create_mission_rrule(5, 10, 240, 0, NULL), 240, 'Friday Midday Care', 'Friday midday care session');

-- From Structure 7 (aff)
-- Friday 10am-2pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'accepted', public.create_mission_rrule(5, 10, 240, 1, NULL), 240, 'Second Week Friday', 'Friday from Structure 7'),
  -- Wednesday 9am-1pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'cancelled', public.create_mission_rrule(3, 9, 240, 2, NULL), 240, 'Third Week Wednesday', 'Cancelled morning');

-- From Structure 8 (b00)
-- Tuesday 2pm-6pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending', public.create_mission_rrule(2, 14, 240, 2, NULL), 240, 'Third Week Tuesday', 'Tuesday from Structure 8'),
  -- Friday 10am-2pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'accepted', public.create_mission_rrule(5, 10, 240, 2, NULL), 240, 'Third Week Friday', 'Friday midday care'),
  -- Wednesday 9am-1pm (240 min), one-time, week 0 (for reports seed - Thomas Leroy)
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'accepted', public.create_mission_rrule(3, 9, 240, 0, NULL), 240, 'Wednesday Morning Care', 'Wednesday morning care session');

-- ============================================================================
-- Professional 015 (Lucie Moreau) - Member of structures: afa, afb, afe, b01, b02
-- Availability: Mon 8am-12pm, Wed 1pm-6pm, Sat 9am-3pm
-- ============================================================================

-- From Structure 2 (afa)
-- Monday 8am-12pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'accepted', public.create_mission_rrule(1, 8, 240, 0, NULL), 240, 'Monday Morning Session', 'Complete morning care'),
  -- Saturday 9am-1pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending', public.create_mission_rrule(6, 9, 240, 0, NULL), 240, 'Saturday Morning', 'Saturday morning care'),
  -- Wednesday 1pm-4pm (180 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'accepted', public.create_mission_rrule(3, 13, 180, 0, NULL), 180, 'Wednesday Afternoon', 'Afternoon session');

-- From Structure 3 (afb)
-- Monday 8am-12pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending', public.create_mission_rrule(1, 8, 240, 1, NULL), 240, 'Second Week Monday', 'Monday from Structure 3'),
  -- Wednesday 1pm-6pm (300 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'declined', public.create_mission_rrule(3, 13, 300, 1, NULL), 300, 'Second Week Wednesday', 'Declined full afternoon');

-- From Structure 6 (afe)
-- Saturday 9am-1pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'accepted', public.create_mission_rrule(6, 9, 240, 1, NULL), 240, 'Second Week Saturday', 'Saturday from Structure 6'),
  -- Wednesday 1pm-5pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending', public.create_mission_rrule(3, 13, 240, 2, NULL), 240, 'Third Week Wednesday', 'Afternoon session'),
  -- Wednesday 1pm-5pm (240 min), one-time, week 0 (for reports seed - Nicolas Garcia)
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'accepted', public.create_mission_rrule(3, 13, 240, 0, NULL), 240, 'Wednesday Afternoon Care', 'Wednesday afternoon care session');

-- From Structure 9 (b01)
-- Monday 8am-12pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'accepted', public.create_mission_rrule(1, 8, 240, 2, NULL), 240, 'Third Week Monday', 'Monday from Structure 9'),
  -- Saturday 9am-1pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'cancelled', public.create_mission_rrule(6, 9, 240, 2, NULL), 240, 'Third Week Saturday', 'Cancelled Saturday'),
  -- Wednesday 1pm-5pm (240 min), one-time, week 0 (for reports seed - Lucie Moreau)
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'accepted', public.create_mission_rrule(3, 13, 240, 0, NULL), 240, 'Wednesday Afternoon Care', 'Wednesday afternoon care session');

-- From Structure 10 (b02)
-- Wednesday 1pm-5pm (240 min), one-time, week 3
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending', public.create_mission_rrule(3, 13, 240, 3, NULL), 240, 'Fourth Week Wednesday', 'Wednesday from Structure 10'),
  -- Monday 8am-12pm (240 min), one-time, week 0 (for reports seed - Lucie Moreau)
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'accepted', public.create_mission_rrule(1, 8, 240, 0, NULL), 240, 'Monday Morning Care', 'Monday morning care session');

-- ============================================================================
-- Professional 016 (Antoine Petit) - Member of structures: af9, afc, aff, b00, b02
-- Availability: Tue 10am-2pm, Thu 8am-4pm, Fri 11am-5pm
-- ============================================================================

-- From Structure 1 (af9)
-- Tuesday 10am-2pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending', public.create_mission_rrule(2, 10, 240, 0, NULL), 240, 'Tuesday Midday Care', 'Midday care with educational activities'),
  -- Thursday 8am-12pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'accepted', public.create_mission_rrule(4, 8, 240, 0, NULL), 240, 'Thursday Morning Session', 'Morning care for infants'),
  -- Friday 11am-3pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'accepted', public.create_mission_rrule(5, 11, 240, 0, NULL), 240, 'Friday Midday', 'Friday midday session');

-- From Structure 4 (afc)
-- Thursday 12pm-4pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'accepted', public.create_mission_rrule(4, 12, 240, 1, NULL), 240, 'Second Week Thursday Afternoon', 'Afternoon from Structure 4'),
  -- Tuesday 10am-2pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending', public.create_mission_rrule(2, 10, 240, 1, NULL), 240, 'Second Week Tuesday', 'Tuesday midday'),
  -- Friday 11am-3pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'declined', public.create_mission_rrule(5, 11, 240, 1, NULL), 240, 'Second Week Friday', 'Declined Friday session');

-- From Structure 7 (aff)
-- Thursday 8am-12pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'accepted', public.create_mission_rrule(4, 8, 240, 2, NULL), 240, 'Third Week Thursday Morning', 'Morning from Structure 7'),
  -- Friday 11am-3pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'cancelled', public.create_mission_rrule(5, 11, 240, 2, NULL), 240, 'Third Week Friday', 'Cancelled Friday');

-- From Structure 8 (b00)
-- Tuesday 10am-2pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending', public.create_mission_rrule(2, 10, 240, 2, NULL), 240, 'Third Week Tuesday', 'Tuesday from Structure 8');

-- From Structure 10 (b02)
-- Thursday 8am-12pm (240 min), one-time, week 3
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'accepted', public.create_mission_rrule(4, 8, 240, 3, NULL), 240, 'Fourth Week Thursday', 'Thursday from Structure 10'),
  -- Friday 11am-3pm (240 min), one-time, week 3
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending', public.create_mission_rrule(5, 11, 240, 3, NULL), 240, 'Fourth Week Friday', 'Friday midday care');

-- ============================================================================
-- Professional 017 (Camille Laurent) - Member of structures: afa, afd, afe, b01
-- Availability: Mon 9am-1pm, Tue 2pm-6pm, Thu 8am-12pm, Sun 10am-4pm
-- ============================================================================

-- From Structure 2 (afa)
-- Monday 9am-1pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'accepted', public.create_mission_rrule(1, 9, 240, 0, NULL), 240, 'Monday Morning Care', 'Morning care session'),
  -- Tuesday 2pm-6pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending', public.create_mission_rrule(2, 14, 240, 0, NULL), 240, 'Tuesday Afternoon', 'Afternoon care'),
  -- Thursday 8am-12pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'accepted', public.create_mission_rrule(4, 8, 240, 0, NULL), 240, 'Thursday Morning', 'Thursday morning session'),
  -- Sunday 10am-2pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending', public.create_mission_rrule(0, 10, 240, 0, NULL), 240, 'Sunday Morning', 'Sunday morning care');

-- From Structure 5 (afd)
-- Monday 9am-1pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'accepted', public.create_mission_rrule(1, 9, 240, 1, NULL), 240, 'Second Week Monday', 'Monday from Structure 5'),
  -- Tuesday 2pm-6pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'declined', public.create_mission_rrule(2, 14, 240, 1, NULL), 240, 'Second Week Tuesday', 'Declined afternoon');

-- From Structure 6 (afe)
-- Thursday 8am-12pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending', public.create_mission_rrule(4, 8, 240, 1, NULL), 240, 'Second Week Thursday', 'Thursday from Structure 6'),
  -- Sunday 10am-2pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'accepted', public.create_mission_rrule(0, 10, 240, 1, NULL), 240, 'Second Week Sunday', 'Sunday from Structure 6');

-- From Structure 9 (b01)
-- Monday 9am-1pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'accepted', public.create_mission_rrule(1, 9, 240, 2, NULL), 240, 'Third Week Monday', 'Monday from Structure 9'),
  -- Sunday 10am-2pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'cancelled', public.create_mission_rrule(0, 10, 240, 2, NULL), 240, 'Third Week Sunday', 'Cancelled Sunday');

-- ============================================================================
-- Professional 018 (Julien Simon) - Member of structures: afb, afc, aff, b00, b02
-- Availability: Mon 1pm-5pm, Wed 9am-3pm, Fri 10am-4pm
-- ============================================================================

-- From Structure 3 (afb)
-- Monday 1pm-5pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'accepted', public.create_mission_rrule(1, 13, 240, 0, NULL), 240, 'Monday Afternoon Consultation', 'Afternoon consultation'),
  -- Wednesday 9am-1pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending', public.create_mission_rrule(3, 9, 240, 0, NULL), 240, 'Wednesday Morning', 'Morning care session'),
  -- Friday 10am-2pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'accepted', public.create_mission_rrule(5, 10, 240, 0, NULL), 240, 'Friday Midday', 'Friday midday care');

-- From Structure 4 (afc)
-- Monday 1pm-5pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending', public.create_mission_rrule(1, 13, 240, 1, NULL), 240, 'Second Week Monday', 'Monday from Structure 4'),
  -- Wednesday 9am-1pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'declined', public.create_mission_rrule(3, 9, 240, 1, NULL), 240, 'Second Week Wednesday', 'Declined morning');

-- From Structure 7 (aff)
-- Friday 10am-2pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'accepted', public.create_mission_rrule(5, 10, 240, 1, NULL), 240, 'Second Week Friday', 'Friday from Structure 7'),
  -- Wednesday 9am-1pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending', public.create_mission_rrule(3, 9, 240, 2, NULL), 240, 'Third Week Wednesday', 'Wednesday morning');

-- From Structure 8 (b00)
-- Monday 1pm-5pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'accepted', public.create_mission_rrule(1, 13, 240, 2, NULL), 240, 'Third Week Monday', 'Monday from Structure 8'),
  -- Friday 10am-2pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'cancelled', public.create_mission_rrule(5, 10, 240, 2, NULL), 240, 'Third Week Friday', 'Cancelled Friday');

-- From Structure 10 (b02)
-- Wednesday 9am-1pm (240 min), one-time, week 3
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending', public.create_mission_rrule(3, 9, 240, 3, NULL), 240, 'Fourth Week Wednesday', 'Wednesday from Structure 10'),
  -- Friday 10am-2pm (240 min), one-time, week 3
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'accepted', public.create_mission_rrule(5, 10, 240, 3, NULL), 240, 'Fourth Week Friday', 'Friday midday care');

-- ============================================================================
-- Professional 019 (Emilie Michel) - Member of structures: af9, afa, afd, b01
-- Availability: Tue 8am-1pm, Thu 2pm-6pm, Sat 9am-5pm
-- ============================================================================

-- From Structure 1 (af9)
-- Tuesday 8am-1pm (300 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'accepted', public.create_mission_rrule(2, 8, 300, 0, NULL), 300, 'Tuesday Full Morning', 'Complete morning care'),
  -- Thursday 2pm-6pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending', public.create_mission_rrule(4, 14, 240, 0, NULL), 240, 'Thursday Afternoon', 'Afternoon care session'),
  -- Saturday 9am-1pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'accepted', public.create_mission_rrule(6, 9, 240, 0, NULL), 240, 'Saturday Morning', 'Saturday morning care');

-- From Structure 2 (afa)
-- Tuesday 8am-12pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending', public.create_mission_rrule(2, 8, 240, 1, NULL), 240, 'Second Week Tuesday', 'Tuesday morning from Structure 2'),
  -- Thursday 2pm-6pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'declined', public.create_mission_rrule(4, 14, 240, 1, NULL), 240, 'Second Week Thursday', 'Declined afternoon');

-- From Structure 5 (afd)
-- Saturday 1pm-5pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'accepted', public.create_mission_rrule(6, 13, 240, 1, NULL), 240, 'Second Week Saturday Afternoon', 'Saturday afternoon from Structure 5'),
  -- Tuesday 8am-1pm (300 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending', public.create_mission_rrule(2, 8, 300, 2, NULL), 300, 'Third Week Tuesday', 'Tuesday from Structure 5');

-- From Structure 9 (b01)
-- Thursday 2pm-6pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'accepted', public.create_mission_rrule(4, 14, 240, 2, NULL), 240, 'Third Week Thursday', 'Thursday from Structure 9'),
  -- Saturday 9am-1pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'cancelled', public.create_mission_rrule(6, 9, 240, 2, NULL), 240, 'Third Week Saturday', 'Cancelled Saturday morning');

-- ============================================================================
-- Professional 01a (Nicolas Garcia) - Member of structures: afb, afe, aff, b00, b02
-- Availability: Mon 10am-2pm, Wed 8am-12pm, Fri 1pm-5pm
-- ============================================================================

-- From Structure 3 (afb)
-- Monday 10am-2pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'accepted', public.create_mission_rrule(1, 10, 240, 0, NULL), 240, 'Monday Midday Care', 'Midday care session'),
  -- Wednesday 8am-12pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending', public.create_mission_rrule(3, 8, 240, 0, NULL), 240, 'Wednesday Morning', 'Morning care'),
  -- Friday 1pm-5pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'accepted', public.create_mission_rrule(5, 13, 240, 0, NULL), 240, 'Friday Afternoon', 'Friday afternoon care');

-- From Structure 6 (afe)
-- Monday 10am-2pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending', public.create_mission_rrule(1, 10, 240, 1, NULL), 240, 'Second Week Monday', 'Monday from Structure 6'),
  -- Wednesday 8am-12pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'declined', public.create_mission_rrule(3, 8, 240, 1, NULL), 240, 'Second Week Wednesday', 'Declined morning');

-- From Structure 7 (aff)
-- Friday 1pm-5pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'accepted', public.create_mission_rrule(5, 13, 240, 1, NULL), 240, 'Second Week Friday', 'Friday from Structure 7'),
  -- Monday 10am-2pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending', public.create_mission_rrule(1, 10, 240, 2, NULL), 240, 'Third Week Monday', 'Monday midday');

-- From Structure 8 (b00)
-- Wednesday 8am-12pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'accepted', public.create_mission_rrule(3, 8, 240, 2, NULL), 240, 'Third Week Wednesday', 'Wednesday from Structure 8'),
  -- Friday 1pm-5pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'cancelled', public.create_mission_rrule(5, 13, 240, 2, NULL), 240, 'Third Week Friday', 'Cancelled Friday');

-- From Structure 10 (b02)
-- Monday 10am-2pm (240 min), one-time, week 3
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending', public.create_mission_rrule(1, 10, 240, 3, NULL), 240, 'Fourth Week Monday', 'Monday from Structure 10'),
  -- Friday 1pm-5pm (240 min), one-time, week 3
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'accepted', public.create_mission_rrule(5, 13, 240, 3, NULL), 240, 'Fourth Week Friday', 'Friday afternoon care');

-- ============================================================================
-- Professional 01b (aed) - Member of structures: af9, afc, afd, b01
-- Availability: Typical weekday hours (using common patterns)
-- ============================================================================

-- From Structure 1 (af9)
-- Monday 9am-1pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'accepted', public.create_mission_rrule(1, 9, 240, 0, NULL), 240, 'Monday Morning Care', 'Morning care session'),
  -- Wednesday 10am-2pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending', public.create_mission_rrule(3, 10, 240, 0, NULL), 240, 'Wednesday Midday', 'Midday care'),
  -- Friday 11am-3pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'accepted', public.create_mission_rrule(5, 11, 240, 0, NULL), 240, 'Friday Midday', 'Friday midday session'),
  -- Tuesday 8am-12pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending', public.create_mission_rrule(2, 8, 240, 0, NULL), 240, 'Tuesday Morning', 'Tuesday morning care');

-- From Structure 4 (afc)
-- Monday 9am-1pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending', public.create_mission_rrule(1, 9, 240, 1, NULL), 240, 'Second Week Monday', 'Monday from Structure 4'),
  -- Wednesday 10am-2pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'declined', public.create_mission_rrule(3, 10, 240, 1, NULL), 240, 'Second Week Wednesday', 'Declined midday');

-- From Structure 5 (afd)
-- Friday 11am-3pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'accepted', public.create_mission_rrule(5, 11, 240, 1, NULL), 240, 'Second Week Friday', 'Friday from Structure 5'),
  -- Monday 9am-1pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending', public.create_mission_rrule(1, 9, 240, 2, NULL), 240, 'Third Week Monday', 'Monday morning care');

-- From Structure 9 (b01)
-- Wednesday 10am-2pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'accepted', public.create_mission_rrule(3, 10, 240, 2, NULL), 240, 'Third Week Wednesday', 'Wednesday from Structure 9'),
  -- Friday 11am-3pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'cancelled', public.create_mission_rrule(5, 11, 240, 2, NULL), 240, 'Third Week Friday', 'Cancelled Friday');

-- ============================================================================
-- Professional 01c (aee) - Member of structures: afa, afb, afe, b02
-- Availability: Typical weekday hours (using common patterns)
-- ============================================================================

-- From Structure 2 (afa)
-- Tuesday 9am-1pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'accepted', public.create_mission_rrule(2, 9, 240, 0, NULL), 240, 'Tuesday Morning Care', 'Morning care session'),
  -- Thursday 10am-2pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending', public.create_mission_rrule(4, 10, 240, 0, NULL), 240, 'Thursday Midday', 'Midday care'),
  -- Saturday 8am-12pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'accepted', public.create_mission_rrule(6, 8, 240, 0, NULL), 240, 'Saturday Morning', 'Saturday morning care'),
  -- Monday 10am-2pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending', public.create_mission_rrule(1, 10, 240, 0, NULL), 240, 'Monday Midday', 'Monday midday session');

-- From Structure 3 (afb)
-- Tuesday 9am-1pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending', public.create_mission_rrule(2, 9, 240, 1, NULL), 240, 'Second Week Tuesday', 'Tuesday from Structure 3'),
  -- Thursday 10am-2pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'declined', public.create_mission_rrule(4, 10, 240, 1, NULL), 240, 'Second Week Thursday', 'Declined midday');

-- From Structure 6 (afe)
-- Saturday 8am-12pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'accepted', public.create_mission_rrule(6, 8, 240, 1, NULL), 240, 'Second Week Saturday', 'Saturday from Structure 6'),
  -- Tuesday 9am-1pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending', public.create_mission_rrule(2, 9, 240, 2, NULL), 240, 'Third Week Tuesday', 'Tuesday morning care');

-- From Structure 10 (b02)
-- Thursday 10am-2pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'accepted', public.create_mission_rrule(4, 10, 240, 2, NULL), 240, 'Third Week Thursday', 'Thursday from Structure 10'),
  -- Saturday 8am-12pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'cancelled', public.create_mission_rrule(6, 8, 240, 2, NULL), 240, 'Third Week Saturday', 'Cancelled Saturday');

-- ============================================================================
-- Professional 01d (aef) - Member of structures: afc, afd, aff, b00, b01
-- Availability: Typical weekday hours (using common patterns)
-- ============================================================================

-- From Structure 4 (afc)
-- Monday 8am-12pm (240 min), one-time, week 0
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'accepted', public.create_mission_rrule(1, 8, 240, 0, NULL), 240, 'Monday Morning Care', 'Morning care session'),
  -- Wednesday 9am-1pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending', public.create_mission_rrule(3, 9, 240, 0, NULL), 240, 'Wednesday Morning', 'Morning care'),
  -- Friday 10am-2pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'accepted', public.create_mission_rrule(5, 10, 240, 0, NULL), 240, 'Friday Midday', 'Friday midday care'),
  -- Tuesday 2pm-6pm (240 min), one-time, week 0
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending', public.create_mission_rrule(2, 14, 240, 0, NULL), 240, 'Tuesday Afternoon', 'Tuesday afternoon care');

-- From Structure 5 (afd)
-- Monday 8am-12pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending', public.create_mission_rrule(1, 8, 240, 1, NULL), 240, 'Second Week Monday', 'Monday from Structure 5'),
  -- Wednesday 9am-1pm (240 min), one-time, week 1
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'declined', public.create_mission_rrule(3, 9, 240, 1, NULL), 240, 'Second Week Wednesday', 'Declined morning');

-- From Structure 7 (aff)
-- Friday 10am-2pm (240 min), one-time, week 1
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'accepted', public.create_mission_rrule(5, 10, 240, 1, NULL), 240, 'Second Week Friday', 'Friday from Structure 7'),
  -- Monday 8am-12pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending', public.create_mission_rrule(1, 8, 240, 2, NULL), 240, 'Third Week Monday', 'Monday morning care');

-- From Structure 8 (b00)
-- Wednesday 9am-1pm (240 min), one-time, week 2
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'accepted', public.create_mission_rrule(3, 9, 240, 2, NULL), 240, 'Third Week Wednesday', 'Wednesday from Structure 8'),
  -- Friday 10am-2pm (240 min), one-time, week 2
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'cancelled', public.create_mission_rrule(5, 10, 240, 2, NULL), 240, 'Third Week Friday', 'Cancelled Friday');

-- From Structure 9 (b01)
-- Monday 8am-12pm (240 min), one-time, week 3
INSERT INTO public.missions (structure_id, professional_id, status, rrule, duration_mn, title, description) VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending', public.create_mission_rrule(1, 8, 240, 3, NULL), 240, 'Fourth Week Monday', 'Monday from Structure 9'),
  -- Friday 10am-2pm (240 min), one-time, week 3
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'accepted', public.create_mission_rrule(5, 10, 240, 3, NULL), 240, 'Fourth Week Friday', 'Friday midday care');

-- Note: get_next_weekday function is kept for potential future use
