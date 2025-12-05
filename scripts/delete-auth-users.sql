-- SQL script to delete all auth users from Supabase
-- WARNING: This will permanently delete ALL auth users!
--
-- Usage:
--   Execute this SQL in Supabase SQL Editor or via psql
--   For local: psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f scripts/delete-auth-users.sql
--
-- Note: This requires service role permissions or direct database access

-- Delete all users from auth.users
-- This will cascade delete related data in public.profiles due to foreign key constraints
DELETE FROM auth.users;

-- Verify deletion
SELECT COUNT(*) as remaining_users FROM auth.users;

