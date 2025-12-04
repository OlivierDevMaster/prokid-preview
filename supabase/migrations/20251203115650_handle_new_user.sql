-- Migration: handle_new_user
-- Purpose: Create function and trigger to automatically create profiles when new users are created
-- Affected tables: profiles
-- Special considerations: Only handles 'professional' and 'structure' roles from user metadata
-- Uses SECURITY DEFINER to allow the trigger to insert/update profiles when called by auth admin role

-- ============================================================================
-- Function: handle_new_user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role text;
  user_first_name text;
  user_last_name text;
  user_avatar_url text;
BEGIN
  -- Extract role from raw_user_meta_data only
  user_role := NEW.raw_user_meta_data->>'role';

  -- Extract optional fields from metadata, handling NULL and empty strings
  user_first_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), '');
  user_last_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '');
  user_avatar_url := NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), '');

  -- Only proceed if role is 'professional' or 'structure'
  IF user_role IN ('professional', 'structure') THEN
    -- Insert profile with the extracted role and optional fields
    INSERT INTO public.profiles (
      user_id,
      role,
      email,
      first_name,
      last_name,
      avatar_url
    )
    VALUES (
      NEW.id,
      user_role::public.role,
      NEW.email,
      user_first_name,
      user_last_name,
      user_avatar_url
    );
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile entry when a new user is created, based on role metadata';

-- ============================================================================
-- Trigger: on_auth_user_created
-- ============================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Function: handle_user_email_update
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only update if email has changed
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    -- Update profile email if profile exists
    UPDATE public.profiles
    SET email = NEW.email
    WHERE public.profiles.user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_user_email_update() IS 'Updates the profile email when the auth.users email changes';

-- ============================================================================
-- Trigger: on_auth_user_email_updated
-- ============================================================================

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_update();

