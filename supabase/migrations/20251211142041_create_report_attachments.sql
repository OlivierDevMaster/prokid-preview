-- Migration: create_report_attachments
-- Purpose: Create report_attachments table with constraints, indexes, triggers, and RLS policies
-- Affected tables: report_attachments
-- Dependencies: Requires reports table to exist

-- ============================================================================
-- Model: report_attachments
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."report_attachments" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "report_id" UUID NOT NULL REFERENCES "public"."reports"("id") ON DELETE CASCADE,
  "file_name" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "file_size" BIGINT NOT NULL,
  "mime_type" TEXT NOT NULL
);

-- Comments
COMMENT ON TABLE "public"."report_attachments" IS 'File attachments for reports. Each report can have up to 10 attachments.';
COMMENT ON COLUMN "public"."report_attachments"."report_id" IS 'Reference to the report this attachment belongs to';
COMMENT ON COLUMN "public"."report_attachments"."file_name" IS 'Original filename of the uploaded file';
COMMENT ON COLUMN "public"."report_attachments"."file_path" IS 'Storage path in the report-attachments bucket';
COMMENT ON COLUMN "public"."report_attachments"."file_size" IS 'File size in bytes';
COMMENT ON COLUMN "public"."report_attachments"."mime_type" IS 'MIME type of the file';

-- ============================================================================
-- Function: check_max_attachments_per_report
-- ============================================================================

-- Function to ensure a report does not exceed 10 attachments
CREATE OR REPLACE FUNCTION "public"."check_max_attachments_per_report"()
RETURNS TRIGGER AS $$
DECLARE
  attachment_count INTEGER;
BEGIN
  -- Count existing attachments for this report
  SELECT COUNT(*) INTO attachment_count
  FROM "public"."report_attachments"
  WHERE "report_id" = NEW."report_id";

  -- If this is an update and the report_id hasn't changed, don't count the current row
  IF TG_OP = 'UPDATE' AND OLD."report_id" = NEW."report_id" THEN
    -- Count is already correct, but we need to check if we're at the limit
    IF attachment_count > 10 THEN
      RAISE EXCEPTION 'Report cannot have more than 10 attachments. Current count: %', attachment_count;
    END IF;
  ELSE
    -- For INSERT or UPDATE with different report_id, check if adding this would exceed limit
    IF attachment_count >= 10 THEN
      RAISE EXCEPTION 'Report cannot have more than 10 attachments. Current count: %', attachment_count;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."check_max_attachments_per_report"() IS 'Ensures that a report cannot have more than 10 attachments';

-- Trigger to enforce max 10 attachments per report
CREATE TRIGGER "check_max_attachments_per_report"
  BEFORE INSERT OR UPDATE OF "report_id" ON "public"."report_attachments"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."check_max_attachments_per_report"();

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_report_attachments_report_id" ON "public"."report_attachments" ("report_id");
CREATE INDEX IF NOT EXISTS "idx_report_attachments_created_at" ON "public"."report_attachments" ("created_at");

-- Triggers
CREATE TRIGGER update_report_attachments_updated_at BEFORE UPDATE ON "public"."report_attachments"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE "public"."report_attachments" ENABLE ROW LEVEL SECURITY;

-- Professionals can view attachments for their own reports
-- Security: Professionals can only view attachments for reports they authored
CREATE POLICY "Professionals can view attachments for their own reports" ON "public"."report_attachments"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."reports"
      WHERE "reports"."id" = "report_attachments"."report_id"
      AND "reports"."author_id" = (SELECT auth.uid())
    )
  );

-- Structures can view attachments for reports of their missions
-- Security: Structures can view attachments for reports of missions they created
CREATE POLICY "Structures can view attachments for their mission reports" ON "public"."report_attachments"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."reports"
      INNER JOIN "public"."missions" ON "missions"."id" = "reports"."mission_id"
      WHERE "reports"."id" = "report_attachments"."report_id"
      AND "missions"."structure_id" = (SELECT auth.uid())
    )
  );

-- Professionals can create attachments for their own reports
-- Security: Professionals can only create attachments for reports they authored
CREATE POLICY "Professionals can create attachments for their own reports" ON "public"."report_attachments"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."reports"
      WHERE "reports"."id" = "report_attachments"."report_id"
      AND "reports"."author_id" = (SELECT auth.uid())
    )
  );

-- Professionals can update attachments for their own reports
-- Security: Professionals can only update attachments for reports they authored
CREATE POLICY "Professionals can update attachments for their own reports" ON "public"."report_attachments"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."reports"
      WHERE "reports"."id" = "report_attachments"."report_id"
      AND "reports"."author_id" = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."reports"
      WHERE "reports"."id" = "report_attachments"."report_id"
      AND "reports"."author_id" = (SELECT auth.uid())
    )
  );

-- Professionals can delete attachments for their own reports
-- Security: Professionals can only delete attachments for reports they authored
CREATE POLICY "Professionals can delete attachments for their own reports" ON "public"."report_attachments"
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."reports"
      WHERE "reports"."id" = "report_attachments"."report_id"
      AND "reports"."author_id" = (SELECT auth.uid())
    )
  );

-- Admins can view all attachments
-- Security: Admins have full access to all attachments
CREATE POLICY "Admins can view all attachments" ON "public"."report_attachments"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can insert attachments
-- Security: Admins have full access to create attachments
CREATE POLICY "Admins can insert attachments" ON "public"."report_attachments"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can update all attachments
-- Security: Admins have full access to update any attachment
CREATE POLICY "Admins can update all attachments" ON "public"."report_attachments"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete attachments
-- Security: Admins have full access to delete any attachment
CREATE POLICY "Admins can delete attachments" ON "public"."report_attachments"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));
