# Reports RLS Access Matrix

This document describes the Row Level Security (RLS) policies for the `reports` table.

## Access Matrix

| User Type                  | SELECT (Own) | SELECT (Mission) | SELECT (Other) | INSERT (Own) | INSERT (Other) | UPDATE (Own) | UPDATE (Other) | DELETE (Own) | DELETE (Other) |
| -------------------------- | ------------ | ---------------- | -------------- | ------------ | -------------- | ------------ | -------------- | ------------ | --------------- |
| Unauthenticated            | ❌           | ❌               | ❌             | ❌           | ❌             | ❌           | ❌             | ❌           | ❌              |
| Authenticated Professional | ✅           | ❌               | ❌             | ✅           | ❌             | ✅           | ❌             | ✅           | ❌              |
| Structure                  | ❌           | ✅               | ❌             | ❌           | ❌             | ❌           | ❌             | ❌           | ❌              |
| Admin                      | ✅ All       | ✅ All           | ✅ All         | ✅           | ✅             | ✅           | ✅             | ✅           | ✅              |

## Legend

- ✅ = Allowed
- ❌ = Denied

## User Types

- **Unauthenticated**: Users who are not signed in (no authentication token). These users access the database using the public `anon` key without any session.
- **Authenticated Professional**: Users who have signed in and have a valid authentication token. They are identified by their `user_id` and have a professional profile.
- **Structure**: Users with the `structure` role in the `profiles` table. They can view reports for missions they created but cannot modify them.
- **Admin**: Users with the `admin` role in the `profiles` table. They have elevated privileges.

**Note**: "Unauthenticated" users are different from Supabase's built-in "anonymous users" feature. Anonymous users in Supabase are a special type of authenticated user that can be created without email/password. Our tests use unauthenticated users (no auth token), which map to Supabase's `anon` role in RLS policies.

## Detailed Rules

### SELECT (Read)

- **Unauthenticated users**: Cannot view any reports
- **Authenticated professionals**: Can only view reports they created (where `author_id` matches their `user_id`)
- **Structures**: Can only view reports for missions they created (where `mission.structure_id` matches their `user_id`)
- **Admins**: Can view all reports

### INSERT (Create)

- **Unauthenticated users**: Cannot create reports
- **Authenticated professionals**: Can only create reports where they are the author (`author_id` must match authenticated user) and the mission is assigned to them (`mission.professional_id` must match authenticated user)
- **Structures**: Cannot create reports
- **Admins**: Can create reports for any professional

### UPDATE (Modify)

- **Unauthenticated users**: Cannot update reports
- **Authenticated professionals**: Can only update reports they created (`author_id` must match authenticated user)
- **Structures**: Cannot update reports
- **Admins**: Can update any report

### DELETE (Remove)

- **Unauthenticated users**: Cannot delete reports
- **Authenticated professionals**: Can only delete reports they created (`author_id` must match authenticated user)
- **Structures**: Cannot delete reports
- **Admins**: Can delete any report

## Notes

- Reports are private by default - only the author (professional) and the structure that created the mission can view them
- Professionals can only create, update, and delete their own reports
- Professionals can only create reports for missions assigned to them (enforced by database trigger)
- Structures can view reports for missions they created but cannot modify them (they are read-only)
- Admins have full access to all operations on all reports
- The `author_id` field in the `reports` table references `professionals.user_id` and is used to enforce ownership
- The `mission_id` field in the `reports` table references `missions.id` and is used to grant read access to structures (via `missions.structure_id`)

