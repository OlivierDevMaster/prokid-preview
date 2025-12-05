# Availabilities RLS Access Matrix

This document describes the Row Level Security (RLS) policies for the `availabilities` table.

## Access Matrix

| User Type                  | SELECT | INSERT (Own) | INSERT (Other) | UPDATE (Own) | UPDATE (Other) | DELETE (Own) | DELETE (Other) |
| -------------------------- | ------ | ------------ | -------------- | ------------ | -------------- | ------------ | -------------- |
| Unauthenticated            | ✅ All | ❌           | ❌             | ❌           | ❌             | ❌           | ❌             |
| Authenticated Professional | ✅ All | ✅           | ❌             | ✅           | ❌             | ✅           | ❌             |
| Admin                      | ✅ All | ✅           | ✅             | ✅           | ✅             | ✅           | ✅             |

## Legend

- ✅ = Allowed
- ❌ = Denied

## User Types

- **Unauthenticated**: Users who are not signed in (no authentication token). These users access the database using the public `anon` key without any session.
- **Authenticated Professional**: Users who have signed in and have a valid authentication token. They are identified by their `user_id`.
- **Admin**: Users with the `admin` role in the `profiles` table. They have elevated privileges.

**Note**: "Unauthenticated" users are different from Supabase's built-in "anonymous users" feature. Anonymous users in Supabase are a special type of authenticated user that can be created without email/password. Our tests use unauthenticated users (no auth token), which map to Supabase's `anon` role in RLS policies.

## Detailed Rules

### SELECT (Read)

- **Unauthenticated users**: Can view all availability entries (public profile data)
- **Authenticated professionals**: Can view all availability entries
- **Admins**: Can view all availability entries

### INSERT (Create)

- **Unauthenticated users**: Cannot create availability entries
- **Authenticated professionals**: Can only create availability entries for themselves (`user_id` must match authenticated user)
- **Admins**: Can create availability entries for any professional

### UPDATE (Modify)

- **Unauthenticated users**: Cannot update availability entries
- **Authenticated professionals**: Can only update their own availability entries (`user_id` must match authenticated user)
- **Admins**: Can update any availability entry

### DELETE (Remove)

- **Unauthenticated users**: Cannot delete availability entries
- **Authenticated professionals**: Can only delete their own availability entries (`user_id` must match authenticated user)
- **Admins**: Can delete any availability entry

## Notes

- All availability entries are considered public data and can be viewed by anyone (including unauthenticated users)
- Professionals can only modify (INSERT, UPDATE, DELETE) their own availability entries
- Admins have full access to all operations on all availability entries
- The `user_id` field in the `availabilities` table references the `professionals.user_id` and is used to enforce ownership
