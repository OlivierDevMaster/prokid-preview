-- Migration: add_professionals_availability_duration_column
-- Purpose: Add availability_start and availability_end columns to professionals table with trigger-based automatic expiration
-- Affected tables: professionals
-- Dependencies: Requires professionals table to exist

-- ============================================================================
-- Add availability duration columns to professionals table
-- ============================================================================

-- Add columns for timed availability windows
ALTER TABLE "public"."professionals"
  ADD COLUMN IF NOT EXISTS "availability_start" TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS "availability_end" TIMESTAMP WITH TIME ZONE;

-- Add constraint to ensure availability_end is after availability_start when both are set
ALTER TABLE "public"."professionals"
  ADD CONSTRAINT "professional_availability_period_check" CHECK (
    "availability_start" IS NULL
    OR "availability_end" IS NULL
    OR "availability_end" >= "availability_start"
  );

-- Add index on availability_end for efficient queries on expiration
CREATE INDEX IF NOT EXISTS "idx_professionals_availability_end" ON "public"."professionals" ("availability_end");

-- Comments
COMMENT ON COLUMN "public"."professionals"."availability_start" IS 'Optional start datetime for temporary availability status';
COMMENT ON COLUMN "public"."professionals"."availability_end" IS 'Optional end datetime for temporary availability status; after this the professional is considered unavailable';

-- ============================================================================
-- Trigger function to enforce availability consistency
-- ============================================================================

-- Trigger function to keep timed availability status consistent with availability_start/availability_end
CREATE OR REPLACE FUNCTION public.enforce_professional_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- If availability window has already ended, force the professional to unavailable
  IF NEW.availability_end IS NOT NULL AND NEW.availability_end < NOW() THEN
    NEW.is_available := FALSE;
  END IF;

  -- When a professional is explicitly set to unavailable, clear the availability window
  IF NEW.is_available = FALSE THEN
    NEW.availability_start := NULL;
    NEW.availability_end := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce availability consistency on writes
CREATE TRIGGER enforce_professional_availability_before_write
  BEFORE INSERT OR UPDATE OF "is_available", "availability_start", "availability_end" ON "public"."professionals"
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_professional_availability();

