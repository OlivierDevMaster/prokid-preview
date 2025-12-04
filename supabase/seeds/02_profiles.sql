-- Seed: profiles
-- Purpose: Manually create profiles for admin users and ensure all profiles exist
-- Note: Professional and structure profiles are auto-created by trigger, but admin profiles need manual creation

-- Insert admin profile (trigger doesn't handle admin role)
INSERT INTO public.profiles (
  user_id,
  role,
  email,
  first_name,
  last_name,
  avatar_url,
  is_onboarded
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin'::public.role,
  'admin@prokid.com',
  'Admin',
  'User',
  NULL,
  TRUE
) ON CONFLICT (user_id) DO NOTHING;

