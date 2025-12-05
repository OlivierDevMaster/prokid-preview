# Professionals RLS Access Matrix

This document describes the Row Level Security (RLS) policies for the `professionals` table.

## Access Matrix

| User Type           | SELECT | INSERT (Own) | INSERT (Other) | UPDATE (Own) | UPDATE (Other) | DELETE (Own) | DELETE (Other) |
| ------------------- | ------ | ------------ | -------------- | ------------ | -------------- | ------------ | -------------- |
| Unauthenticated    | ✅ All | ❌           | ❌             | ❌           | ❌             | ❌           | ❌             |
| Authenticated User | ✅ All | ✅           | ❌             | ✅           | ❌             | ❌           | ❌             |
| Admin              | ✅ All | ✅           | ✅             | ✅           | ✅             | ✅           | ✅             |

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

- **Unauthenticated users**: Can view all professional profiles (public profile data)
- **Authenticated users**: Can view all professional profiles
- **Admins**: Can view all professional profiles

### INSERT (Create)

- **Unauthenticated users**: Cannot create professional profiles
- **Authenticated users**: Can only create their own professional profile (`user_id` must match authenticated user)
- **Admins**: Can create professional profiles for any user

### UPDATE (Modify)

- **Unauthenticated users**: Cannot update professional profiles
- **Authenticated users**: Can only update their own professional profile (`user_id` must match authenticated user)
- **Admins**: Can update any professional profile

### DELETE (Remove)

- **Unauthenticated users**: Cannot delete professional profiles
- **Authenticated users**: Cannot delete professional profiles (even their own)
- **Admins**: Can delete any professional profile

## Notes

- All professional profiles are considered public data and can be viewed by anyone (including unauthenticated users)
- Users can only create and update their own professional profile
- Users cannot delete professional profiles, even their own (only admins can delete)
- The `user_id` field in the `professionals` table references the `profiles.user_id` and is used to enforce ownership
- This restriction on DELETE for regular users helps maintain data integrity and prevents accidental profile deletion

