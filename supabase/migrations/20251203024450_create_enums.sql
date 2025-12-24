-- Migration: create_enums
-- Purpose: Create enum types for the database schema
-- Affected objects: role enum type, invitation_status enum type, membership_action enum type, locale enum type, mission_status enum type, report_status enum type, subscription_status enum type

CREATE TYPE "public"."role" AS ENUM ('professional', 'structure', 'admin');

COMMENT ON TYPE "public"."role" IS 'User role types: professional, structure, or admin';

CREATE TYPE "public"."invitation_status" AS ENUM ('pending', 'accepted', 'declined');

COMMENT ON TYPE "public"."invitation_status" IS 'Status of structure invitations to professionals';

CREATE TYPE "public"."membership_action" AS ENUM ('joined', 'left', 'removed_by_structure', 'removed_by_admin');

COMMENT ON TYPE "public"."membership_action" IS 'Action types for membership history: joined, left, removed_by_structure, removed_by_admin';

CREATE TYPE "public"."locale" AS ENUM ('en', 'fr');

COMMENT ON TYPE "public"."locale" IS 'Supported locales: en (English) or fr (French)';

CREATE TYPE "public"."mission_status" AS ENUM ('pending', 'accepted', 'declined', 'cancelled', 'expired', 'ended');

COMMENT ON TYPE "public"."mission_status" IS 'Status of missions: pending, accepted, declined, cancelled, expired, or ended';

CREATE TYPE "public"."report_status" AS ENUM ('draft', 'sent');

COMMENT ON TYPE "public"."report_status" IS 'Status of a report: draft (work in progress) or sent (submitted to structure)';

CREATE TYPE "public"."subscription_status" AS ENUM (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
);

COMMENT ON TYPE "public"."subscription_status" IS 'Stripe subscription status: active, trialing, past_due, canceled, unpaid, incomplete, incomplete_expired, or paused';
