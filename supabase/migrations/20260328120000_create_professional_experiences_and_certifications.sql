-- Migration: create_professional_experiences_and_certifications
-- Purpose: Add tables for professional work experiences and certifications/diplomas
-- Dependencies: Requires professionals table to exist

-- ============================================================================
-- Table: professional_experiences
-- ============================================================================

CREATE TABLE IF NOT EXISTS "public"."professional_experiences" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "user_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "organization" TEXT NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "description" TEXT,
  CONSTRAINT "professional_experiences_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE
);

COMMENT ON TABLE "public"."professional_experiences" IS 'Work experiences for professionals (mini-CV)';

CREATE INDEX IF NOT EXISTS "idx_professional_experiences_user_id"
  ON "public"."professional_experiences" ("user_id");

CREATE INDEX IF NOT EXISTS "idx_professional_experiences_start_date"
  ON "public"."professional_experiences" ("user_id", "start_date" DESC);

-- Updated_at trigger
CREATE TRIGGER "set_professional_experiences_updated_at"
  BEFORE UPDATE ON "public"."professional_experiences"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE "public"."professional_experiences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view experiences"
  ON "public"."professional_experiences" FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Professionals can insert their own experiences"
  ON "public"."professional_experiences" FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = "user_id");

CREATE POLICY "Professionals can update their own experiences"
  ON "public"."professional_experiences" FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");

CREATE POLICY "Professionals can delete their own experiences"
  ON "public"."professional_experiences" FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = "user_id");

CREATE POLICY "Admins can manage all experiences"
  ON "public"."professional_experiences" FOR ALL TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- Table: professional_certifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS "public"."professional_certifications" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "user_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "institution" TEXT,
  "year_obtained" INTEGER NOT NULL,
  CONSTRAINT "professional_certifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE
);

COMMENT ON TABLE "public"."professional_certifications" IS 'Certifications and diplomas for professionals';

CREATE INDEX IF NOT EXISTS "idx_professional_certifications_user_id"
  ON "public"."professional_certifications" ("user_id");

-- Updated_at trigger
CREATE TRIGGER "set_professional_certifications_updated_at"
  BEFORE UPDATE ON "public"."professional_certifications"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE "public"."professional_certifications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view certifications"
  ON "public"."professional_certifications" FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Professionals can insert their own certifications"
  ON "public"."professional_certifications" FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = "user_id");

CREATE POLICY "Professionals can update their own certifications"
  ON "public"."professional_certifications" FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");

CREATE POLICY "Professionals can delete their own certifications"
  ON "public"."professional_certifications" FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = "user_id");

CREATE POLICY "Admins can manage all certifications"
  ON "public"."professional_certifications" FOR ALL TO authenticated
  USING ((SELECT public.is_admin()));
