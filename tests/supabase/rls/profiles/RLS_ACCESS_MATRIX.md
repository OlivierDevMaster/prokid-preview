# Profiles RLS Access Matrix

This document describes the Row Level Security (RLS) policies for the `profiles` table.

## Access Matrix

| User Type           | SELECT | INSERT | UPDATE (Own) | UPDATE (Other) | DELETE (Own) | DELETE (Other) |
| ------------------- | ------ | ------ | ------------ | -------------- | ------------ | -------------- |
| Unauthenticated    | ✅ All | ❌     | ❌           | ❌             | ❌           | ❌             |
| Authenticated User | ✅ All | ❌     | ✅*          | ❌             | ✅           | ❌             |
| Admin              | ✅ All | ❌     | ✅*          | ✅*            | ✅           | ✅             |

\* Users and admins can update profiles but **cannot update email and role fields**

## Legend

- ✅ = Allowed
- ❌ = Denied

## User Types

- **Unauthenticated**: Users who are not signed in (no authentication token). These users access the database using the public `anon` key without any session.
- **Authenticated User**: Users who have signed in and have a valid authentication token. They are identified by their `user_id`.
- **Admin**: Users with the `admin` role in the `profiles` table. They have elevated privileges.

**Note**: "Unauthenticated" users are different from Supabase's built-in "anonymous users" feature. Anonymous users in Supabase are a special type of authenticated user that can be created without email/password. Our tests use unauthenticated users (no auth token), which map to Supabase's `anon` role in RLS policies.

## Detailed Rules

### SELECT (Read)

- **Unauthenticated users**: Can view all profiles
- **Authenticated users**: Can view all profiles
- **Admins**: Can view all profiles

### INSERT (Create)

- **Unauthenticated users**: Cannot insert profiles directly
- **Authenticated users**: Cannot insert profiles directly
- **Admins**: Cannot insert profiles directly
- **Note**: Profile creation is handled automatically by a trigger with `SECURITY DEFINER` when new users are created in `auth.users`. No user can insert profiles directly through RLS.

### UPDATE (Modify)

- **Unauthenticated users**: Cannot update profiles
- **Authenticated users**: Can update their own profile, but **cannot update email and role fields**
- **Admins**: Can update any profile, but **cannot update email and role fields**
- **Note**: Email and role updates are prevented by a trigger, not RLS policies.

### DELETE (Remove)

- **Unauthenticated users**: Cannot delete profiles
- **Authenticated users**: Can delete their own profile
- **Admins**: Can delete any profile

## Notes

- Profile creation is handled automatically by the `handle_new_user()` trigger function when users sign up
- Users can update their own profile fields (first_name, last_name, avatar_url, is_onboarded) but not email or role
- Admins can update any profile fields (first_name, last_name, avatar_url, is_onboarded) but not email or role
- Email updates are handled by the `handle_user_email_update()` trigger function when the auth.users email changes
- Role changes should be restricted and handled through administrative processes

