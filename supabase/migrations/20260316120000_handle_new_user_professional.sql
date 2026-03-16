-- Migration: handle_new_user_professional
-- Purpose: Reimplement handle_new_user to create a placeholder row in professionals when role is professional
-- Affected tables: professionals (via handle_new_user function)
-- Special considerations: Uses placeholder values for NOT NULL columns; onboarding will update with real data.
-- Does not modify triggers or other functions from handle_new_user migration.

-- ============================================================================
-- Function: handle_new_user (reimplemented)
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_role text;
  user_first_name text;
  user_last_name text;
  user_avatar_url text;
  user_preferred_language text;
  structure_name text;
begin
  -- Extract role from raw_user_meta_data only
  user_role := new.raw_user_meta_data->>'role';

  -- Extract optional fields from metadata, handling null and empty strings
  user_first_name := nullif(regexp_replace(new.raw_user_meta_data->>'first_name', '^\s+|\s+$', '', 'g'), '');
  user_last_name := nullif(regexp_replace(new.raw_user_meta_data->>'last_name', '^\s+|\s+$', '', 'g'), '');
  user_avatar_url := nullif(regexp_replace(new.raw_user_meta_data->>'avatar_url', '^\s+|\s+$', '', 'g'), '');

  -- Extract preferred_language from metadata, defaulting to 'fr' if not provided or invalid
  user_preferred_language := nullif(regexp_replace(new.raw_user_meta_data->>'preferred_language', '^\s+|\s+$', '', 'g'), '');
  if user_preferred_language is null or user_preferred_language not in ('en', 'fr') then
    user_preferred_language := 'fr';
  end if;

  -- Only proceed if role is 'professional' or 'structure'
  if user_role in ('professional', 'structure') then
    -- Insert profile with the extracted role and optional fields
    insert into public.profiles (
      user_id,
      role,
      email,
      first_name,
      last_name,
      avatar_url,
      preferred_language
    )
    values (
      new.id,
      user_role::public.role,
      new.email,
      user_first_name,
      user_last_name,
      user_avatar_url,
      user_preferred_language::public.locale
    );

    -- If role is 'structure', automatically create structure record
    if user_role = 'structure' then
      if user_first_name is not null and user_last_name is not null then
        structure_name := trim(user_first_name || ' ' || user_last_name);
      elsif user_first_name is not null then
        structure_name := user_first_name;
      elsif user_last_name is not null then
        structure_name := user_last_name;
      else
        structure_name := new.email;
      end if;

      insert into public.structures (
        user_id,
        name
      )
      values (
        new.id,
        structure_name
      );
    end if;

    -- If role is 'professional', create placeholder row in professionals (filled by onboarding)
    if user_role = 'professional' then
      insert into public.professionals (
        user_id,
        city,
        intervention_radius_km,
        experience_years,
        hourly_rate
      )
      values (
        new.id,
        '',
        0,
        0,
        0
      );
    end if;
  end if;

  return new;
end;
$$;

comment on function public.handle_new_user() is 'Creates a profile when a new user is created, based on role metadata. Creates a structure record if role is structure. Creates a placeholder professionals row if role is professional (to be filled by onboarding).';
