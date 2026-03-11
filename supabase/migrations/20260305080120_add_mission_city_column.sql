-- Migration: add_mission_city_column
-- Purpose: Add a city column to missions to store the city where the mission takes place

ALTER TABLE "public"."missions"
ADD COLUMN IF NOT EXISTS "city" text;

COMMENT ON COLUMN "public"."missions"."city" IS 'City where the mission takes place';
