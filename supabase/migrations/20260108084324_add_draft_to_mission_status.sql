-- Migration: add_draft_to_mission_status
-- Purpose: Add 'draft' status to mission_status enum
-- Affected objects: mission_status enum type

ALTER TYPE "public"."mission_status" ADD VALUE IF NOT EXISTS 'draft';

COMMENT ON TYPE "public"."mission_status" IS 'Status of missions: pending, accepted, declined, cancelled, expired, ended, or draft';

