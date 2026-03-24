-- Seed: structures
-- Purpose: Create structure profiles for users with role='structure'
-- Note: Profiles are automatically created by the handle_new_user trigger from auth.users

-- Update profiles to set is_onboarded = true for all structures
UPDATE public.profiles
SET is_onboarded = TRUE
WHERE role = 'structure'::public.role
  AND user_id >= '08fb0a72-ee9b-4771-bf24-7fe19c869af9'::uuid
  AND user_id <= '08fb0a72-ee9b-4771-bf24-7fe19c869afd'::uuid;

-- Insert structure profiles
INSERT INTO public.structures (
  user_id,
  name,
  stripe_customer_id
) VALUES
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
  'Happy Kids Daycare Center',
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
  'Sunshine Childcare Services',
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
  'Little Stars Nursery',
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
  'Rainbow Children Center',
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
  'Butterfly Daycare',
  NULL
) ON CONFLICT (user_id) DO NOTHING;

-- Seed geolocation columns for proximity search (idempotent)
-- Note: functions are qualified with `extensions` to avoid search_path issues.
WITH structure_geo AS (
  SELECT *
  FROM (
    VALUES
      ('08fb0a72-ee9b-4771-bf24-7fe19c869af9'::uuid, 'Happy Kids Daycare Center'::text, 48.8566::numeric, 2.3522::numeric),
      ('08fb0a72-ee9b-4771-bf24-7fe19c869afa'::uuid, 'Sunshine Childcare Services'::text, 45.7578::numeric, 4.8320::numeric),
      ('08fb0a72-ee9b-4771-bf24-7fe19c869afb'::uuid, 'Little Stars Nursery'::text, 43.3000::numeric, 5.3700::numeric),
      ('08fb0a72-ee9b-4771-bf24-7fe19c869afc'::uuid, 'Rainbow Children Center'::text, 43.6047::numeric, 1.4442::numeric),
      ('08fb0a72-ee9b-4771-bf24-7fe19c869afd'::uuid, 'Butterfly Daycare'::text, 44.8380::numeric, -0.5800::numeric)
  ) AS t(user_id, name, latitude, longitude)
)
UPDATE public.structures s
SET
  name = sg.name,
  latitude = sg.latitude,
  longitude = sg.longitude,
  location = extensions.ST_SetSRID(
    extensions.ST_MakePoint(sg.longitude::double precision, sg.latitude::double precision),
    4326
  )::extensions.geography
FROM structure_geo sg
WHERE s.user_id = sg.user_id;
