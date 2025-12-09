-- Migration: create_missions
-- Purpose: Create missions table with constraints, indexes, triggers, and RLS policies
-- Affected tables: missions
-- Dependencies: Requires professionals, structures, and structure_members tables to exist

-- ============================================================================
-- Model: missions
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."missions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "structure_id" UUID NOT NULL REFERENCES "public"."structures"("user_id") ON DELETE CASCADE,
  "professional_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE,
  "status" "public"."mission_status" DEFAULT 'pending' NOT NULL,
  "rrule" TEXT NOT NULL,
  "duration_mn" INTEGER NOT NULL,
  "dtstart" TIMESTAMP WITH TIME ZONE,
  "until" TIMESTAMP WITH TIME ZONE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "missions_duration_positive" CHECK ("duration_mn" > 0)
);

-- Comments
COMMENT ON TABLE "public"."missions" IS 'Missions assigned by structures to their professional members. Supports recurring missions using RRULE (RFC 5545) format';
COMMENT ON COLUMN "public"."missions"."structure_id" IS 'Reference to the structure creating the mission';
COMMENT ON COLUMN "public"."missions"."professional_id" IS 'Reference to the professional member assigned to the mission';
COMMENT ON COLUMN "public"."missions"."status" IS 'Current status of the mission: pending, accepted, declined, or cancelled';
COMMENT ON COLUMN "public"."missions"."rrule" IS 'Complete RRULE string including DTSTART, RRULE, UNTIL, and EXDATE (RFC 5545 format, newline-separated)';
COMMENT ON COLUMN "public"."missions"."duration_mn" IS 'Duration of the mission in minutes';
COMMENT ON COLUMN "public"."missions"."dtstart" IS 'Extracted DTSTART from rrule (automatically populated via trigger)';
COMMENT ON COLUMN "public"."missions"."until" IS 'Extracted UNTIL from rrule (automatically populated via trigger, can be NULL for long-term missions)';
COMMENT ON COLUMN "public"."missions"."title" IS 'Mission title';
COMMENT ON COLUMN "public"."missions"."description" IS 'Mission description/details';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_missions_structure_id" ON "public"."missions" ("structure_id");
CREATE INDEX IF NOT EXISTS "idx_missions_professional_id" ON "public"."missions" ("professional_id");
CREATE INDEX IF NOT EXISTS "idx_missions_status" ON "public"."missions" ("status");
CREATE INDEX IF NOT EXISTS "idx_missions_dtstart" ON "public"."missions" ("dtstart");
CREATE INDEX IF NOT EXISTS "idx_missions_until" ON "public"."missions" ("until");
CREATE INDEX IF NOT EXISTS "idx_missions_professional_status" ON "public"."missions" ("professional_id", "status");

-- ============================================================================
-- Triggers
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON "public"."missions"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to extract dates from RRULE
CREATE TRIGGER extract_mission_rrule_dates
  BEFORE INSERT OR UPDATE OF "rrule" ON "public"."missions"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."extract_rrule_dates"();

-- ============================================================================
-- Function: prevent_mission_status_rollback
-- ============================================================================

-- Function to prevent status changes from accepted/declined back to pending
CREATE OR REPLACE FUNCTION "public"."prevent_mission_status_rollback"()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent changing status from 'accepted' or 'declined' back to 'pending'
  IF (OLD."status" = 'accepted' OR OLD."status" = 'declined') AND NEW."status" = 'pending' THEN
    RAISE EXCEPTION 'Cannot change mission status from % to pending. Once a mission is accepted or declined, it cannot be reverted to pending.', OLD."status";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."prevent_mission_status_rollback"() IS 'Prevents changing mission status from accepted or declined back to pending';

-- Trigger to prevent status rollback
CREATE TRIGGER "trigger_prevent_mission_status_rollback"
  BEFORE UPDATE OF "status" ON "public"."missions"
  FOR EACH ROW
  WHEN (OLD."status" IS DISTINCT FROM NEW."status")
  EXECUTE FUNCTION "public"."prevent_mission_status_rollback"();

-- ============================================================================
-- Function: check_professional_membership
-- ============================================================================

-- Function to check if professional is a member of the structure
CREATE OR REPLACE FUNCTION "public"."check_professional_membership"()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if professional is a member of the structure
  IF NOT EXISTS (
    SELECT 1
    FROM "public"."structure_members"
    WHERE "structure_id" = NEW."structure_id"
      AND "professional_id" = NEW."professional_id"
      AND "deleted_at" IS NULL
  ) THEN
    RAISE EXCEPTION 'Professional % is not a member of structure %. Only members can be assigned missions.', NEW."professional_id", NEW."structure_id";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."check_professional_membership"() IS 'Ensures that only professional members of a structure can be assigned missions';

-- Trigger to check membership on insert and update
CREATE TRIGGER "trigger_check_professional_membership"
  BEFORE INSERT OR UPDATE OF "structure_id", "professional_id" ON "public"."missions"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."check_professional_membership"();

-- RLS
ALTER TABLE "public"."missions" ENABLE ROW LEVEL SECURITY;

-- Structures can view missions they created
CREATE POLICY "Structures can view missions they created" ON "public"."missions"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "structure_id");

-- Professionals can view missions they received
CREATE POLICY "Professionals can view missions they received" ON "public"."missions"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "professional_id");

-- Structures can create missions for their members
CREATE POLICY "Structures can create missions" ON "public"."missions"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = "structure_id"
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'structure'
    )
    AND EXISTS (
      SELECT 1 FROM public.structure_members
      WHERE structure_id = (SELECT auth.uid())
      AND professional_id = "professional_id"
      AND deleted_at IS NULL
    )
  );

-- Professionals can update missions they received (to accept or decline)
CREATE POLICY "Professionals can update missions they received" ON "public"."missions"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "professional_id")
  WITH CHECK (
    (SELECT auth.uid()) = "professional_id"
    AND ("status" = 'accepted' OR "status" = 'declined')
  );

-- Structures can update missions they created (to cancel)
CREATE POLICY "Structures can update missions they created" ON "public"."missions"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "structure_id")
  WITH CHECK ((SELECT auth.uid()) = "structure_id");

-- Structures can delete missions they created
CREATE POLICY "Structures can delete missions they created" ON "public"."missions"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "structure_id");

-- Admins can view all missions
CREATE POLICY "Admins can view all missions" ON "public"."missions"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all missions
CREATE POLICY "Admins can update all missions" ON "public"."missions"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can insert missions
CREATE POLICY "Admins can insert missions" ON "public"."missions"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete missions
CREATE POLICY "Admins can delete missions" ON "public"."missions"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

