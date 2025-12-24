# Structures RLS Access Matrix

This document describes the Row Level Security (RLS) policies for the `structures` table.

## Access Matrix

| User Type           | SELECT | INSERT (Own) | INSERT (Other) | UPDATE (Own) | UPDATE (Other) | DELETE (Own) | DELETE (Other) |
| ------------------- | ------ | ------------ | -------------- | ------------ | -------------- | ------------ | -------------- |
| Unauthenticated    | ✅ All | ❌           | ❌             | ❌           | ❌             | ❌           | ❌             |
| Authenticated User | ✅ All | ❌           | ❌             | ❌           | ❌             | ❌           | ❌             |
| Structure          | ✅ All | ✅           | ❌             | ✅           | ❌             | ✅           | ❌             |
| Admin              | ✅ All | ✅           | ✅             | ✅           | ✅             | ✅           | ✅             |

## Legend

- ✅ = Allowed
- ❌ = Denied

## User Types

- **Unauthenticated**: Users who are not signed in (no authentication token). These users access the database using the public `anon` key without any session.
- **Authenticated User**: Users who have signed in and have a valid authentication token but are not structures or admins. They are identified by their `user_id`.
- **Structure**: Users with the `structure` role in the `profiles` table. They can view all structures, create their own structure profile, and update their own structure profile.
- **Admin**: Users with the `admin` role in the `profiles` table. They have elevated privileges.

**Note**: "Unauthenticated" users are different from Supabase's built-in "anonymous users" feature. Anonymous users in Supabase are a special type of authenticated user that can be created without email/password. Our tests use unauthenticated users (no auth token), which map to Supabase's `anon` role in RLS policies.

## Detailed Rules

### SELECT (Read)

- **Unauthenticated users**: Can view all structure profiles (public profile data)
- **Authenticated users**: Can view all structure profiles
- **Structures**: Can view all structure profiles
- **Admins**: Can view all structure profiles

### INSERT (Create)

- **Unauthenticated users**: Cannot create structure profiles
- **Authenticated users**: Cannot create structure profiles (only structures can create their own)
- **Structures**: Can only create their own structure profile (`user_id` must match authenticated user)
- **Admins**: Can create structure profiles for any user

### UPDATE (Modify)

- **Unauthenticated users**: Cannot update structure profiles
- **Authenticated users**: Cannot update structure profiles (only structures can update their own)
- **Structures**: Can only update their own structure profile (`user_id` must match authenticated user)
- **Admins**: Can update any structure profile

### DELETE (Remove)

- **Unauthenticated users**: Cannot delete structure profiles
- **Authenticated users**: Cannot delete structure profiles
- **Structures**: Can only delete their own structure profile (`user_id` must match authenticated user)
- **Admins**: Can delete any structure profile

## Notes

- All structure profiles are considered public data and can be viewed by anyone (including unauthenticated users)
- Only structures can create, update, and delete their own structure profile
- The `user_id` field in the `structures` table references the `profiles.user_id` and is used to enforce ownership
- This restriction on DELETE for structures helps maintain data integrity and prevents accidental profile deletion
- Regular authenticated users (non-structures) cannot create or modify structure profiles, as they are not structures themselves

