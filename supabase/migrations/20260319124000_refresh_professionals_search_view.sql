-- Refresh professionals_with_profiles_search view to include
-- latitude/longitude columns added in 20260319120000
DROP VIEW IF EXISTS public.professionals_with_profiles_search;
CREATE VIEW public.professionals_with_profiles_search AS
SELECT
  professionals.*,
  profiles.first_name,
  profiles.last_name,
  profiles.email as profile_email,
  profiles.avatar_url,
  profiles.is_onboarded,
  profiles.role as profile_role,
  profiles.created_at as profile_created_at
FROM
  public.professionals
  INNER JOIN public.profiles ON professionals.user_id = profiles.user_id;
