-- Migration: create_enums
-- Purpose: Create enum types for the database schema
-- Affected objects: role enum type, invitation_status enum type, membership_action enum type, locale enum type

CREATE TYPE "public"."role" AS ENUM ('professional', 'structure', 'admin');

COMMENT ON TYPE "public"."role" IS 'User role types: professional, structure, or admin';

CREATE TYPE "public"."invitation_status" AS ENUM ('pending', 'accepted', 'declined');

COMMENT ON TYPE "public"."invitation_status" IS 'Status of structure invitations to professionals';

CREATE TYPE "public"."membership_action" AS ENUM ('joined', 'left', 'removed_by_structure', 'removed_by_admin');

COMMENT ON TYPE "public"."membership_action" IS 'Action types for membership history: joined, left, removed_by_structure, removed_by_admin';

CREATE TYPE "public"."locale" AS ENUM ('en', 'fr');

COMMENT ON TYPE "public"."locale" IS 'Supported locales: en (English) or fr (French)';
