-- Migration: create_availabilities_and_reports
-- Purpose: Create availabilities and reports tables with constraints, indexes, triggers, and RLS policies
-- Affected tables: availabilities, reports
-- Dependencies: Requires professionals and structures tables to exist

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
  "user_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE
);

-- Comments
COMMENT ON TABLE "public"."availabilities" IS 'Professional availability/schedule entries using RRULE (RFC 5545) format';
COMMENT ON COLUMN "public"."availabilities"."rrule" IS 'Complete RRULE string including DTSTART, RRULE, and EXDATE (RFC 5545 format, newline-separated)';
COMMENT ON COLUMN "public"."availabilities"."duration_mn" IS 'Duration of the availability in minutes';
COMMENT ON COLUMN "public"."availabilities"."user_id" IS 'Reference to the professional who owns this availability entry';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_availabilities_user_id" ON "public"."availabilities" ("user_id");

-- Triggers
CREATE TRIGGER update_availabilities_updated_at BEFORE UPDATE ON "public"."availabilities"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can update all availability
CREATE POLICY "Admins can update all availability" ON "public"."availabilities"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can insert availability
CREATE POLICY "Admins can insert availability" ON "public"."availabilities"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can delete availability
CREATE POLICY "Admins can delete availability" ON "public"."availabilities"
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

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
  "recipient_id" UUID NOT NULL REFERENCES "public"."structures"("user_id") ON DELETE CASCADE
);

-- Comments
COMMENT ON TABLE "public"."reports" IS 'Reports from professionals to structures';
COMMENT ON COLUMN "public"."reports"."title" IS 'Report title';
COMMENT ON COLUMN "public"."reports"."content" IS 'Report content/description';
COMMENT ON COLUMN "public"."reports"."author_id" IS 'Reference to the professional who created this report';
COMMENT ON COLUMN "public"."reports"."recipient_id" IS 'Reference to the structure receiving this report';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_reports_author_id" ON "public"."reports" ("author_id");
CREATE INDEX IF NOT EXISTS "idx_reports_recipient_id" ON "public"."reports" ("recipient_id");
CREATE INDEX IF NOT EXISTS "idx_reports_created_at" ON "public"."reports" ("created_at");

-- Triggers
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON "public"."reports"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;

-- Professionals can create reports
CREATE POLICY "Professionals can create reports" ON "public"."reports"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = "author_id");

-- Professionals can view their own reports
CREATE POLICY "Professionals can view their own reports" ON "public"."reports"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "author_id");

-- Structures can view reports they received
CREATE POLICY "Structures can view reports they received" ON "public"."reports"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "recipient_id");

-- Professionals can update their own reports
CREATE POLICY "Professionals can update their own reports" ON "public"."reports"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "author_id")
  WITH CHECK ((SELECT auth.uid()) = "author_id");

-- Professionals can delete their own reports
CREATE POLICY "Professionals can delete their own reports" ON "public"."reports"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "author_id");

-- Admins can view all reports
CREATE POLICY "Admins can view all reports" ON "public"."reports"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all reports
CREATE POLICY "Admins can update all reports" ON "public"."reports"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can insert reports
CREATE POLICY "Admins can insert reports" ON "public"."reports"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete reports
CREATE POLICY "Admins can delete reports" ON "public"."reports"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

