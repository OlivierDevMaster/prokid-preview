-- Seed: structures
-- Purpose: Create structure profiles for users with role='structure'
-- Note: Profiles are automatically created by the handle_new_user trigger from auth.users

-- Update profiles to set is_onboarded = true for all structures
UPDATE public.profiles
SET is_onboarded = TRUE
WHERE role = 'structure'::public.role
  AND user_id >= '08fb0a72-ee9b-4771-bf24-7fe19c869af9'::uuid
  AND user_id <= '08fb0a72-ee9b-4771-bf24-7fe19c869b02'::uuid;

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
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869afe',
  'Wonderland Childcare',
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aff',
  'Little Explorers Academy',
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b00',
  'Bright Future Daycare',
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b01',
  'Tiny Tots Nursery',
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869b02',
  'Growing Minds Center',
  NULL
) ON CONFLICT (user_id) DO NOTHING;
