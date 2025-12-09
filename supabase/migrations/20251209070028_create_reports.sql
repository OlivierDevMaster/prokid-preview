-- Migration: create_reports
-- Purpose: Create reports table with constraints, indexes, triggers, and RLS policies
-- Affected tables: reports
-- Dependencies: Requires professionals and missions tables to exist

-- ============================================================================
-- Model: reports
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."reports" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "author_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE,
  "mission_id" UUID NOT NULL REFERENCES "public"."missions"("id") ON DELETE CASCADE
);

-- Comments
COMMENT ON TABLE "public"."reports" IS 'Reports from professionals about their missions. Multiple reports can be created for the same mission since missions can be long-term jobs.';
COMMENT ON COLUMN "public"."reports"."title" IS 'Report title';
COMMENT ON COLUMN "public"."reports"."content" IS 'Report content/description';
COMMENT ON COLUMN "public"."reports"."author_id" IS 'Reference to the professional who created this report (must match mission.professional_id)';
COMMENT ON COLUMN "public"."reports"."mission_id" IS 'Reference to the mission this report is about';

-- ============================================================================
-- Function: check_report_author_matches_mission_professional
-- ============================================================================

-- Function to ensure author_id matches mission.professional_id
-- This function ensures that the professional creating the report is the one
-- assigned to the mission. This prevents professionals from creating reports
-- for missions they're not assigned to.
CREATE OR REPLACE FUNCTION "public"."check_report_author_matches_mission_professional"()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "public"."missions"
    WHERE "missions"."id" = NEW."mission_id"
    AND "missions"."professional_id" = NEW."author_id"
  ) THEN
    RAISE EXCEPTION 'Professional % is not assigned to mission %. Only the assigned professional can create reports for a mission.', NEW."author_id", NEW."mission_id";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION "public"."check_report_author_matches_mission_professional"() IS 'Ensures that only the professional assigned to a mission can create reports for that mission';

-- Trigger to enforce author_id matches mission.professional_id
CREATE TRIGGER "check_report_author_matches_mission_professional"
  BEFORE INSERT OR UPDATE OF "author_id", "mission_id" ON "public"."reports"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."check_report_author_matches_mission_professional"();

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_reports_author_id" ON "public"."reports" ("author_id");
CREATE INDEX IF NOT EXISTS "idx_reports_mission_id" ON "public"."reports" ("mission_id");
CREATE INDEX IF NOT EXISTS "idx_reports_created_at" ON "public"."reports" ("created_at");

-- Triggers
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON "public"."reports"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;

-- Professionals can create reports for their missions
-- Security: Professionals can only create reports for missions they're assigned to
-- (enforced by the constraint reports_author_matches_mission_professional)
CREATE POLICY "Professionals can create reports for their missions" ON "public"."reports"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = "author_id"
    AND EXISTS (
      SELECT 1 FROM "public"."missions"
      WHERE "missions"."id" = "reports"."mission_id"
      AND "missions"."professional_id" = (SELECT auth.uid())
    )
  );

-- Professionals can view reports they created
-- Security: Professionals can only view reports they authored
CREATE POLICY "Professionals can view their own reports" ON "public"."reports"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "author_id");

-- Structures can view reports for missions they created
-- Security: Structures can view reports for missions they assigned to professionals
CREATE POLICY "Structures can view reports for their missions" ON "public"."reports"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."missions"
      WHERE "missions"."id" = "reports"."mission_id"
      AND "missions"."structure_id" = (SELECT auth.uid())
    )
  );

-- Professionals can update their own reports
-- Security: Professionals can only update reports they authored
CREATE POLICY "Professionals can update their own reports" ON "public"."reports"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "author_id")
  WITH CHECK ((SELECT auth.uid()) = "author_id");

-- Professionals can delete their own reports
-- Security: Professionals can only delete reports they authored
CREATE POLICY "Professionals can delete their own reports" ON "public"."reports"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "author_id");

-- Admins can view all reports
-- Security: Admins have full access to all reports
CREATE POLICY "Admins can view all reports" ON "public"."reports"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all reports
-- Security: Admins have full access to update any report
CREATE POLICY "Admins can update all reports" ON "public"."reports"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can insert reports
-- Security: Admins have full access to create reports
CREATE POLICY "Admins can insert reports" ON "public"."reports"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete reports
-- Security: Admins have full access to delete any report
CREATE POLICY "Admins can delete reports" ON "public"."reports"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

