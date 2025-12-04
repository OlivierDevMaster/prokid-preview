-- Seed: availabilities
-- Purpose: Create availability entries for professionals using RRULE format
-- RRULE format: DTSTART:YYYYMMDDTHHMMSSZ;RRULE:FREQ=WEEKLY;BYDAY=...;DURATION:PT...H;EXDATE:YYYYMMDDTHHMMSSZ
-- Note: get_rrule_day function converts day offset to RRULE day abbreviation


-- Professional 010 (John Doe) - Therapist with morning and afternoon sessions
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000010', 1, 9, 3, ARRAY[15, 22]); -- Monday 9am-12pm, not available on specific Mondays
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000010', 1, 14, 4); -- Monday 2pm-6pm weekly
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000010', 2, 8, 4, ARRAY[16]); -- Tuesday 8am-12pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000010', 3, 10, 6); -- Wednesday 10am-4pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000010', 5, 9, 8); -- Friday 9am-5pm
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000010', 10, 10, 5); -- Special Saturday session
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000010', 20, 14, 3); -- Special Monday session

-- Professional 011 (Marie Martin) - Doctor with regular hours
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000011', 1, 8, 5); -- Monday 8am-1pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000011', 2, 14, 4, ARRAY[9, 23]); -- Tuesday 2pm-6pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000011', 4, 9, 6); -- Thursday 9am-3pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000011', 6, 10, 6); -- Saturday 10am-4pm
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000011', 12, 8, 4); -- Special Thursday morning

-- Professional 012 (Pierre Dupont) - Consultant with flexible hours
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000012', 1, 13, 4); -- Monday 1pm-5pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000012', 3, 9, 3, ARRAY[17]); -- Wednesday 9am-12pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000012', 3, 14, 4); -- Wednesday 2pm-6pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000012', 7, 8, 8, ARRAY[14, 21]); -- Sunday 8am-4pm (some Sundays off)
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000012', 11, 10, 6); -- Special Tuesday
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000012', 18, 13, 3); -- Special Wednesday

-- Professional 013 (Sophie Bernard) - Part-time availability
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000013', 1, 9, 6, ARRAY[8]); -- Monday 9am-3pm (except one Monday)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000013', 2, 10, 6); -- Tuesday 10am-4pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000013', 4, 8, 5); -- Thursday 8am-1pm
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000013', 13, 9, 4); -- Special Monday

-- Professional 014 (Thomas Leroy) - Evening specialist
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000014', 2, 14, 4); -- Tuesday 2pm-6pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000014', 3, 9, 8, ARRAY[10, 24]); -- Wednesday 9am-5pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000014', 5, 10, 6); -- Friday 10am-4pm
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000014', 14, 11, 5); -- Special Tuesday

-- Continue with other professionals...
-- Professional 015 (Lucie Moreau)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000015', 1, 8, 4); -- Monday 8am-12pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000015', 3, 13, 5, ARRAY[17]); -- Wednesday 1pm-6pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000015', 6, 9, 6); -- Saturday 9am-3pm
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000015', 15, 8, 6); -- Special Saturday

-- Professional 016 (Antoine Petit)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000016', 2, 10, 4, ARRAY[16]); -- Tuesday 10am-2pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000016', 4, 8, 8); -- Thursday 8am-4pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000016', 5, 11, 6); -- Friday 11am-5pm
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000016', 19, 14, 4); -- Special Thursday

-- Professional 017 (Camille Laurent)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000017', 1, 9, 4); -- Monday 9am-1pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000017', 2, 14, 4, ARRAY[9, 23]); -- Tuesday 2pm-6pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000017', 4, 8, 4); -- Thursday 8am-12pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000017', 7, 10, 6); -- Sunday 10am-4pm
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000017', 21, 9, 5); -- Special Monday

-- Professional 018 (Julien Simon)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000018', 1, 13, 4, ARRAY[8]); -- Monday 1pm-5pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000018', 3, 9, 6); -- Wednesday 9am-3pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000018', 5, 10, 6); -- Friday 10am-4pm
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000018', 16, 10, 7); -- Special Wednesday

-- Professional 019 (Emilie Michel)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000019', 2, 8, 5); -- Tuesday 8am-1pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000019', 4, 14, 4, ARRAY[11, 25]); -- Thursday 2pm-6pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-000000000019', 6, 9, 8); -- Saturday 9am-5pm
SELECT public.create_onetime_availability('00000000-0000-0000-0000-000000000019', 22, 8, 6); -- Special Saturday

-- Professional 01a (Nicolas Garcia)
SELECT public.create_recurring_availability('00000000-0000-0000-0000-00000000001a', 1, 10, 4, ARRAY[15]); -- Monday 10am-2pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-00000000001a', 3, 8, 4); -- Wednesday 8am-12pm
SELECT public.create_recurring_availability('00000000-0000-0000-0000-00000000001a', 5, 13, 4); -- Friday 1pm-5pm
SELECT public.create_onetime_availability('00000000-0000-0000-0000-00000000001a', 17, 11, 4); -- Special Wednesday
SELECT public.create_onetime_availability('00000000-0000-0000-0000-00000000001a', 24, 14, 3); -- Special Monday

-- Clean up temporary functions if desired (optional)
-- DROP FUNCTION public.create_recurring_availability;
-- DROP FUNCTION public.create_onetime_availability;
-- DROP FUNCTION public.format_exdate;
