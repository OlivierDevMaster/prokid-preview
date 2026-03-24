-- Migration: add_mission_adress_column
-- Purpose: Add a address column to missions to store the address where the mission takes place

ALTER TABLE "public"."missions"
ADD COLUMN IF NOT EXISTS "address" text;

COMMENT ON COLUMN "public"."missions"."address" IS 'Address where the mission takes place';

