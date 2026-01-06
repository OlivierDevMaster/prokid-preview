-- Seed: availabilities
-- Purpose: Create availability entries for professionals using RRULE format
-- RRULE format: DTSTART:YYYYMMDDTHHMMSSZ\nRRULE:BYDAY=...;FREQ=WEEKLY\nEXDATE:YYYYMMDDTHHMMSSZ,...
-- Note: RRULE format uses newlines (not semicolons). Duration is stored separately in duration_mn column.
-- Note: seeds_get_rrule_day function converts day offset to RRULE day abbreviation


-- Professional 010 (John Doe) - Therapist with morning and afternoon sessions
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 1, 9, 180); -- Monday 9am-12pm (180 min)
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 1, 14, 240); -- Monday 2pm-6pm (240 min)
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 3, 10, 360); -- Wednesday 10am-4pm (360 min)

-- Professional 011 (Marie Martin) - Doctor with regular hours
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 1, 8, 300); -- Monday 8am-1pm (300 min)
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 2, 14, 240); -- Tuesday 2pm-6pm (240 min)
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 4, 9, 360); -- Thursday 9am-3pm (360 min)

-- Professional 012 (Pierre Dupont) - Consultant with flexible hours
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 1, 13, 240); -- Monday 1pm-5pm (240 min)
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 3, 9, 180); -- Wednesday 9am-12pm (180 min)
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 3, 14, 240); -- Wednesday 2pm-6pm (240 min)

-- Professional 013 (Sophie Bernard) - Part-time availability
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 1, 9, 360); -- Monday 9am-3pm (360 min)
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 2, 10, 360); -- Tuesday 10am-4pm (360 min)
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 4, 8, 300); -- Thursday 8am-1pm (300 min)

-- Professional 014 (Thomas Leroy) - Evening specialist
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 2, 14, 240); -- Tuesday 2pm-6pm (240 min)
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 3, 9, 480); -- Wednesday 9am-5pm (480 min)
SELECT public.seeds_create_recurring_availability('08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 5, 10, 360); -- Friday 10am-4pm (360 min)

-- Clean up temporary functions if desired (optional)
-- DROP FUNCTION public.seeds_create_recurring_availability;
-- DROP FUNCTION public.seeds_create_onetime_availability;
-- DROP FUNCTION public.seeds_format_exdate;
