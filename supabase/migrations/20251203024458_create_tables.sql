-- Migration: create_tables
-- Purpose: Create all database tables with constraints, indexes, triggers, and RLS policies
-- Affected tables: newsletters, plannings, profiles, reports
-- Special considerations: All tables have RLS enabled by default for security

-- ============================================================================
-- Model: newsletters
-- ============================================================================

CREATE TABLE IF NOT EXISTS "public"."newsletters" (
  "id" BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  CONSTRAINT "newsletters_email_unique" UNIQUE ("email")
);

COMMENT ON TABLE "public"."newsletters" IS 'Newsletter subscriptions';
COMMENT ON COLUMN "public"."newsletters"."email" IS 'Subscriber email address';
COMMENT ON COLUMN "public"."newsletters"."name" IS 'Optional subscriber name';

CREATE INDEX IF NOT EXISTS "idx_newsletters_email" ON "public"."newsletters" ("email");

ALTER TABLE "public"."newsletters" ENABLE ROW LEVEL SECURITY;

-- Allow public subscription to newsletter
CREATE POLICY "Allow public to subscribe to newsletter" ON "public"."newsletters"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- ============================================================================
-- Model: plannings
-- ============================================================================

CREATE TABLE IF NOT EXISTS "public"."plannings" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "start_time" TIME WITHOUT TIME ZONE NOT NULL,
  "end_time" TIME WITHOUT TIME ZONE,
  "user" UUID DEFAULT auth.uid() NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  CONSTRAINT "plannings_time_check" CHECK ("end_time" IS NULL OR "end_time" > "start_time")
);

COMMENT ON TABLE "public"."plannings" IS 'User planning/schedule entries';
COMMENT ON COLUMN "public"."plannings"."date" IS 'Date of the planning entry';
COMMENT ON COLUMN "public"."plannings"."start_time" IS 'Start time of the planning entry';
COMMENT ON COLUMN "public"."plannings"."end_time" IS 'End time of the planning entry (optional)';
COMMENT ON COLUMN "public"."plannings"."user" IS 'Reference to the user who owns this planning entry';

CREATE INDEX IF NOT EXISTS "idx_plannings_user" ON "public"."plannings" ("user");
CREATE INDEX IF NOT EXISTS "idx_plannings_date" ON "public"."plannings" ("date");
CREATE INDEX IF NOT EXISTS "idx_plannings_user_date" ON "public"."plannings" ("user", "date");

CREATE TRIGGER update_plannings_updated_at BEFORE UPDATE ON "public"."plannings"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE "public"."plannings" ENABLE ROW LEVEL SECURITY;

-- Users can view their own planning entries
CREATE POLICY "Users can view their own planning" ON "public"."plannings"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "user");

-- Users can insert their own planning entries
CREATE POLICY "Users can insert their own planning" ON "public"."plannings"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = "user");

-- Users can update their own planning entries
CREATE POLICY "Users can update their own planning" ON "public"."plannings"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user")
  WITH CHECK ((SELECT auth.uid()) = "user");

-- Users can delete their own planning entries
CREATE POLICY "Users can delete their own planning" ON "public"."plannings"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "user");

-- ============================================================================
-- Model: profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS "public"."profiles" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "user" UUID DEFAULT auth.uid() NOT NULL UNIQUE REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT,
  "email" TEXT NOT NULL,
  "status" TEXT DEFAULT 'created'::TEXT NOT NULL,
  "role" "public"."role" NOT NULL,
  "phone" TEXT,
  "jobs" TEXT[],
  "postal_code" TEXT,
  "city" TEXT,
  "intervention_zone" TEXT,
  "professional_email" TEXT,
  "description" TEXT,
  "experience" NUMERIC,
  "hourly_rate" NUMERIC,
  "avatar" TEXT,
  CONSTRAINT "status_check" CHECK (("status" = ANY (ARRAY['created'::TEXT, 'banned'::TEXT, 'validated'::TEXT]))),
  CONSTRAINT "experience_check" CHECK ("experience" IS NULL OR "experience" >= 0),
  CONSTRAINT "hourly_rate_check" CHECK ("hourly_rate" IS NULL OR "hourly_rate" >= 0)
);

COMMENT ON TABLE "public"."profiles" IS 'User profiles with extended information';
COMMENT ON COLUMN "public"."profiles"."status" IS 'Profile status: created, validated, or banned';
COMMENT ON COLUMN "public"."profiles"."role" IS 'User role: professional, structure, or admin';
COMMENT ON COLUMN "public"."profiles"."experience" IS 'Years of experience (must be >= 0)';
COMMENT ON COLUMN "public"."profiles"."hourly_rate" IS 'Hourly rate in currency (must be >= 0)';
COMMENT ON COLUMN "public"."profiles"."jobs" IS 'Array of job titles or specializations';

CREATE INDEX IF NOT EXISTS "idx_profiles_user" ON "public"."profiles" ("user");
CREATE INDEX IF NOT EXISTS "idx_profiles_email" ON "public"."profiles" ("email");
CREATE INDEX IF NOT EXISTS "idx_profiles_status" ON "public"."profiles" ("status");
CREATE INDEX IF NOT EXISTS "idx_profiles_role" ON "public"."profiles" ("role");

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON "public"."profiles"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- Allow public profile creation during signup
CREATE POLICY "Allow public to create profiles" ON "public"."profiles"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON "public"."profiles"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "user");

-- Public can view validated profiles
CREATE POLICY "Users can view public profiles" ON "public"."profiles"
  FOR SELECT
  TO authenticated, anon
  USING ("status" = 'validated');

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON "public"."profiles"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user")
  WITH CHECK ((SELECT auth.uid()) = "user");

-- ============================================================================
-- Model: reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS "public"."reports" (
  "id" BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "title" TEXT NOT NULL,
  "contents" TEXT NOT NULL,
  "user" UUID DEFAULT auth.uid() NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

COMMENT ON TABLE "public"."reports" IS 'User reports or feedback';
COMMENT ON COLUMN "public"."reports"."title" IS 'Report title';
COMMENT ON COLUMN "public"."reports"."contents" IS 'Report content/description';
COMMENT ON COLUMN "public"."reports"."user" IS 'Reference to the user who created this report';

CREATE INDEX IF NOT EXISTS "idx_reports_user" ON "public"."reports" ("user");
CREATE INDEX IF NOT EXISTS "idx_reports_created_at" ON "public"."reports" ("created_at");

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON "public"."reports"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;

-- Users can create their own reports
CREATE POLICY "Users can create their own reports" ON "public"."reports"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = "user");

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON "public"."reports"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "user");

-- Users can update their own reports
CREATE POLICY "Users can update their own reports" ON "public"."reports"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user")
  WITH CHECK ((SELECT auth.uid()) = "user");

-- Users can delete their own reports
CREATE POLICY "Users can delete their own reports" ON "public"."reports"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "user");
