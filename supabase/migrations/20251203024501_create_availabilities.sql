-- Migration: create_availabilities
-- Purpose: Create availabilities table with constraints, indexes, triggers, and RLS policies
-- Affected tables: availabilities
-- Dependencies: Requires professionals table to exist

-- ============================================================================
-- Model: availabilities
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."availabilities" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "rrule" TEXT NOT NULL,
  "duration_mn" INTEGER NOT NULL,
  "dtstart" TIMESTAMP WITH TIME ZONE,
  "until" TIMESTAMP WITH TIME ZONE,
  "user_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE
);

-- Comments
COMMENT ON TABLE "public"."availabilities" IS 'Professional availability/schedule entries using RRULE (RFC 5545) format';
COMMENT ON COLUMN "public"."availabilities"."rrule" IS 'Complete RRULE string including DTSTART, RRULE, UNTIL, and EXDATE (RFC 5545 format, newline-separated)';
COMMENT ON COLUMN "public"."availabilities"."duration_mn" IS 'Duration of the availability in minutes';
COMMENT ON COLUMN "public"."availabilities"."dtstart" IS 'Extracted DTSTART from rrule (automatically populated via trigger)';
COMMENT ON COLUMN "public"."availabilities"."until" IS 'Extracted UNTIL from rrule (automatically populated via trigger, can be NULL for long-term availabilities)';
COMMENT ON COLUMN "public"."availabilities"."user_id" IS 'Reference to the professional who owns this availability entry';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_availabilities_user_id" ON "public"."availabilities" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_availabilities_dtstart" ON "public"."availabilities" ("dtstart");
CREATE INDEX IF NOT EXISTS "idx_availabilities_until" ON "public"."availabilities" ("until");

-- Triggers
CREATE TRIGGER update_availabilities_updated_at BEFORE UPDATE ON "public"."availabilities"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to extract dates from RRULE
CREATE TRIGGER extract_availability_rrule_dates
  BEFORE INSERT OR UPDATE OF "rrule" ON "public"."availabilities"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."extract_rrule_dates"();

-- RLS
ALTER TABLE "public"."availabilities" ENABLE ROW LEVEL SECURITY;

-- Everyone can view availability entries (public profile data)
CREATE POLICY "Everyone can view availability entries" ON "public"."availabilities"
  FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- Professionals can insert their own availability entries
CREATE POLICY "Professionals can insert their own availability" ON "public"."availabilities"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Professionals can update their own availability entries
CREATE POLICY "Professionals can update their own availability" ON "public"."availabilities"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Professionals can delete their own availability entries
CREATE POLICY "Professionals can delete their own availability" ON "public"."availabilities"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id");

-- Admins can view all availability
CREATE POLICY "Admins can view all availability" ON "public"."availabilities"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all availability
CREATE POLICY "Admins can update all availability" ON "public"."availabilities"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can insert availability
CREATE POLICY "Admins can insert availability" ON "public"."availabilities"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete availability
CREATE POLICY "Admins can delete availability" ON "public"."availabilities"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));


