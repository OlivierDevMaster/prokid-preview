-- Migration: create_professionals_search_view
-- Purpose: Create a view that combines professionals and profiles tables for search functionality
-- Affected tables: professionals, profiles
-- Special considerations: This view enables OR searches across multiple tables using Supabase's .or() method

-- ============================================================================
-- View: professionals_with_profiles_search
-- ============================================================================

CREATE OR REPLACE VIEW public.professionals_with_profiles_search AS
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

COMMENT ON VIEW public.professionals_with_profiles_search IS 'View combining professionals and profiles tables for search functionality. Enables OR searches across description, first_name, and last_name fields.';

-- ============================================================================
-- RLS Policies for the view
-- ============================================================================

-- Enable RLS on the view
ALTER VIEW public.professionals_with_profiles_search SET (security_invoker = true);

-- Anyone can view professionals with profiles (same as professionals table)
-- The view inherits RLS from the underlying tables
