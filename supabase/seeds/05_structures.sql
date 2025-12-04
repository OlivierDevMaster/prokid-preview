-- Seed: structures
-- Purpose: Create structure profiles for users with role='structure'
-- Note: Profiles are automatically created by the handle_new_user trigger from auth.users

-- Update profiles to set is_onboarded = true for all structures
UPDATE public.profiles
SET is_onboarded = TRUE
WHERE role = 'structure'::public.role
  AND user_id >= '00000000-0000-0000-0000-000000000030'::uuid
  AND user_id <= '00000000-0000-0000-0000-000000000039'::uuid;

-- Insert structure profiles
INSERT INTO public.structures (
  user_id,
  name,
  stripe_customer_id
) VALUES
(
  '00000000-0000-0000-0000-000000000030',
  'Happy Kids Daycare Center',
  NULL
),
(
  '00000000-0000-0000-0000-000000000031',
  'Sunshine Childcare Services',
  NULL
),
(
  '00000000-0000-0000-0000-000000000032',
  'Little Stars Nursery',
  NULL
),
(
  '00000000-0000-0000-0000-000000000033',
  'Rainbow Children Center',
  NULL
),
(
  '00000000-0000-0000-0000-000000000034',
  'Butterfly Daycare',
  NULL
),
(
  '00000000-0000-0000-0000-000000000035',
  'Wonderland Childcare',
  NULL
),
(
  '00000000-0000-0000-0000-000000000036',
  'Little Explorers Academy',
  NULL
),
(
  '00000000-0000-0000-0000-000000000037',
  'Bright Future Daycare',
  NULL
),
(
  '00000000-0000-0000-0000-000000000038',
  'Tiny Tots Nursery',
  NULL
),
(
  '00000000-0000-0000-0000-000000000039',
  'Growing Minds Center',
  NULL
) ON CONFLICT (user_id) DO NOTHING;
