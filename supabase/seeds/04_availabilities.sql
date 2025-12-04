-- Seed: availabilities
-- Purpose: Create availability entries for professionals using RRULE format
-- RRULE format: DTSTART:YYYYMMDDTHHMMSSZ\nRRULE:BYDAY=...;FREQ=WEEKLY\nEXDATE:YYYYMMDDTHHMMSSZ,...
-- Note: RRULE format uses newlines (not semicolons). Duration is stored separately in duration_mn column.
-- Note: get_rrule_day function converts day offset to RRULE day abbreviation


-- Professional 010 (John Doe) - Therapist with morning and afternoon sessions
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000010', 1, 9, 180, ARRAY[15, 22]); -- Monday 9am-12pm (180 min), not available on specific Mondays
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000010', 1, 14, 240); -- Monday 2pm-6pm (240 min) weekly
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000010', 2, 8, 240, ARRAY[16]); -- Tuesday 8am-12pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000010', 3, 10, 360); -- Wednesday 10am-4pm (360 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000010', 5, 9, 480); -- Friday 9am-5pm (480 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000010', 10, 10, 300); -- Special Saturday session (300 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000010', 20, 14, 180); -- Special Monday session (180 min)

-- Professional 011 (Marie Martin) - Doctor with regular hours
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000011', 1, 8, 300); -- Monday 8am-1pm (300 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000011', 2, 14, 240, ARRAY[9, 23]); -- Tuesday 2pm-6pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000011', 4, 9, 360); -- Thursday 9am-3pm (360 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000011', 6, 10, 360); -- Saturday 10am-4pm (360 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000011', 12, 8, 240); -- Special Thursday morning (240 min)

-- Professional 012 (Pierre Dupont) - Consultant with flexible hours
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000012', 1, 13, 240); -- Monday 1pm-5pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000012', 3, 9, 180, ARRAY[17]); -- Wednesday 9am-12pm (180 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000012', 3, 14, 240); -- Wednesday 2pm-6pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000012', 7, 8, 480, ARRAY[14, 21]); -- Sunday 8am-4pm (480 min, some Sundays off)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000012', 11, 10, 360); -- Special Tuesday (360 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000012', 18, 13, 180); -- Special Wednesday (180 min)

-- Professional 013 (Sophie Bernard) - Part-time availability
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000013', 1, 9, 360, ARRAY[8]); -- Monday 9am-3pm (360 min, except one Monday)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000013', 2, 10, 360); -- Tuesday 10am-4pm (360 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000013', 4, 8, 300); -- Thursday 8am-1pm (300 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000013', 13, 9, 240); -- Special Monday (240 min)

-- Professional 014 (Thomas Leroy) - Evening specialist
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000014', 2, 14, 240); -- Tuesday 2pm-6pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000014', 3, 9, 480, ARRAY[10, 24]); -- Wednesday 9am-5pm (480 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000014', 5, 10, 360); -- Friday 10am-4pm (360 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000014', 14, 11, 300); -- Special Tuesday (300 min)

-- Continue with other professionals...
-- Professional 015 (Lucie Moreau)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000015', 1, 8, 240); -- Monday 8am-12pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000015', 3, 13, 300, ARRAY[17]); -- Wednesday 1pm-6pm (300 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000015', 6, 9, 360); -- Saturday 9am-3pm (360 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000015', 15, 8, 360); -- Special Saturday (360 min)

-- Professional 016 (Antoine Petit)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000016', 2, 10, 240, ARRAY[16]); -- Tuesday 10am-2pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000016', 4, 8, 480); -- Thursday 8am-4pm (480 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000016', 5, 11, 360); -- Friday 11am-5pm (360 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000016', 19, 14, 240); -- Special Thursday (240 min)

-- Professional 017 (Camille Laurent)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000017', 1, 9, 240); -- Monday 9am-1pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000017', 2, 14, 240, ARRAY[9, 23]); -- Tuesday 2pm-6pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000017', 4, 8, 240); -- Thursday 8am-12pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000017', 7, 10, 360); -- Sunday 10am-4pm (360 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000017', 21, 9, 300); -- Special Monday (300 min)

-- Professional 018 (Julien Simon)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000018', 1, 13, 240, ARRAY[8]); -- Monday 1pm-5pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000018', 3, 9, 360); -- Wednesday 9am-3pm (360 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000018', 5, 10, 360); -- Friday 10am-4pm (360 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000018', 16, 10, 420); -- Special Wednesday (420 min)

-- Professional 019 (Emilie Michel)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000019', 2, 8, 300); -- Tuesday 8am-1pm (300 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000019', 4, 14, 240, ARRAY[11, 25]); -- Thursday 2pm-6pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000019', 6, 9, 480); -- Saturday 9am-5pm (480 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000019', 22, 8, 360); -- Special Saturday (360 min)

-- Professional 01a (Nicolas Garcia)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-00000000001a', 1, 10, 240, ARRAY[15]); -- Monday 10am-2pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-00000000001a', 3, 8, 240); -- Wednesday 8am-12pm (240 min)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-00000000001a', 5, 13, 240); -- Friday 1pm-5pm (240 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-00000000001a', 17, 11, 240); -- Special Wednesday (240 min)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-00000000001a', 24, 14, 180); -- Special Monday (180 min)

-- Clean up temporary functions if desired (optional)
-- DROP FUNCTION public.create_recurring_availability;
-- DROP FUNCTION public.create_onetime_availability;
-- DROP FUNCTION public.format_exdate;
