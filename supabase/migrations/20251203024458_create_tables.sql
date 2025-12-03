-- Migration: create_tables
-- Purpose: Create all database tables with constraints, indexes, triggers, and RLS policies
-- Affected tables: newsletters, plannings, profiles, reports
-- Special considerations: All tables have RLS enabled by default for security

-- ============================================================================
-- Model: newsletters
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."newsletters" (
  "id" BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT
);

-- Comments
COMMENT ON TABLE "public"."newsletters" IS 'Newsletter subscriptions';
COMMENT ON COLUMN "public"."newsletters"."email" IS 'Subscriber email address';
COMMENT ON COLUMN "public"."newsletters"."name" IS 'Optional subscriber name';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_newsletters_email" ON "public"."newsletters" ("email");

-- RLS
ALTER TABLE "public"."newsletters" ENABLE ROW LEVEL SECURITY;

-- Allow public subscription to newsletter
CREATE POLICY "Allow public to subscribe to newsletter" ON "public"."newsletters"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- ============================================================================
-- Model: profiles
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."profiles" (
  "user_id" UUID NOT NULL PRIMARY KEY REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "role" "public"."role" NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "first_name" TEXT,
  "last_name" TEXT,
  "avatar_url" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Comments
COMMENT ON TABLE "public"."profiles" IS 'User profiles';
COMMENT ON COLUMN "public"."profiles"."user_id" IS 'Reference to the user';
COMMENT ON COLUMN "public"."profiles"."role" IS 'User role: professional, structure, or admin';
COMMENT ON COLUMN "public"."profiles"."email" IS 'User email address';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_profiles_role" ON "public"."profiles" ("role");
CREATE INDEX IF NOT EXISTS "idx_profiles_email" ON "public"."profiles" ("email");

-- RLS
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
  USING ((SELECT auth.uid()) = "user_id");

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON "public"."profiles"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- ============================================================================
-- Model: professionals
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."professionals" (
  "user_id" UUID NOT NULL PRIMARY KEY REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "city" TEXT NOT NULL,
  "postal_code" TEXT,
  "intervention_radius_km" NUMERIC NOT NULL,
  "professional_email" TEXT NOT NULL,
  "phone" TEXT,
  "description" TEXT,
  "experience_years" NUMERIC NOT NULL,
  "hourly_rate" NUMERIC(10, 2) NOT NULL,
  "verified_at" TIMESTAMP WITH TIME ZONE,
  "is_available" BOOLEAN DEFAULT TRUE NOT NULL,
  "rating" NUMERIC DEFAULT 0,
  "reviews_count" INTEGER DEFAULT 0 NOT NULL,
  "skills" TEXT[],
  "is_certified" BOOLEAN DEFAULT FALSE NOT NULL,
  CONSTRAINT "intervention_radius_km_check" CHECK ("intervention_radius_km" >= 0),
  CONSTRAINT "experience_years_check" CHECK ("experience_years" >= 0),
  CONSTRAINT "hourly_rate_check" CHECK ("hourly_rate" >= 0),
  CONSTRAINT "rating_check" CHECK ("rating" >= 0 AND "rating" <= 5)
);

-- Comments
COMMENT ON TABLE "public"."professionals" IS 'Professional user profiles with extended information';
COMMENT ON COLUMN "public"."professionals"."user_id" IS 'Reference to the profile user';
COMMENT ON COLUMN "public"."professionals"."city" IS 'City where the professional operates';
COMMENT ON COLUMN "public"."professionals"."postal_code" IS 'Postal code of the professional location';
COMMENT ON COLUMN "public"."professionals"."intervention_radius_km" IS 'Maximum distance in kilometers the professional is willing to travel';
COMMENT ON COLUMN "public"."professionals"."professional_email" IS 'Professional contact email address';
COMMENT ON COLUMN "public"."professionals"."phone" IS 'Professional contact phone number';
COMMENT ON COLUMN "public"."professionals"."description" IS 'Professional description or bio';
COMMENT ON COLUMN "public"."professionals"."experience_years" IS 'Years of professional experience';
COMMENT ON COLUMN "public"."professionals"."hourly_rate" IS 'Hourly rate in currency';
COMMENT ON COLUMN "public"."professionals"."verified_at" IS 'Timestamp when the professional was verified';
COMMENT ON COLUMN "public"."professionals"."is_available" IS 'Whether the professional is currently available for work';
COMMENT ON COLUMN "public"."professionals"."rating" IS 'Average rating from reviews (0-5)';
COMMENT ON COLUMN "public"."professionals"."reviews_count" IS 'Total number of reviews received';
COMMENT ON COLUMN "public"."professionals"."skills" IS 'Array of professional skills or specializations';
COMMENT ON COLUMN "public"."professionals"."is_certified" IS 'Whether the professional has certifications';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_professionals_city" ON "public"."professionals" ("city");
CREATE INDEX IF NOT EXISTS "idx_professionals_postal_code" ON "public"."professionals" ("postal_code");
CREATE INDEX IF NOT EXISTS "idx_professionals_is_available" ON "public"."professionals" ("is_available");
CREATE INDEX IF NOT EXISTS "idx_professionals_is_certified" ON "public"."professionals" ("is_certified");
CREATE INDEX IF NOT EXISTS "idx_professionals_rating" ON "public"."professionals" ("rating");

-- Triggers
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON "public"."professionals"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE "public"."professionals" ENABLE ROW LEVEL SECURITY;

-- Users can view all professionals
CREATE POLICY "Users can view all professionals" ON "public"."professionals"
  FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- Users can update their own professional profile
CREATE POLICY "Users can update their own professional profile" ON "public"."professionals"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- ============================================================================
-- Model: structures
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."structures" (
  "user_id" UUID NOT NULL PRIMARY KEY REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "name" TEXT NOT NULL
);

-- Comments
COMMENT ON TABLE "public"."structures" IS 'Structure user profiles';
COMMENT ON COLUMN "public"."structures"."user_id" IS 'Reference to the profile user';
COMMENT ON COLUMN "public"."structures"."name" IS 'Structure name';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_structures_name" ON "public"."structures" ("name");

-- Triggers
CREATE TRIGGER update_structures_updated_at BEFORE UPDATE ON "public"."structures"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE "public"."structures" ENABLE ROW LEVEL SECURITY;

-- Everyone can view structures (public profile data)
CREATE POLICY "Everyone can view structures" ON "public"."structures"
  FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- Users can insert their own structure profile
CREATE POLICY "Users can insert their own structure profile" ON "public"."structures"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Users can update their own structure profile
CREATE POLICY "Users can update their own structure profile" ON "public"."structures"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Users can delete their own structure profile
CREATE POLICY "Users can delete their own structure profile" ON "public"."structures"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id");

-- ============================================================================
-- Model: plannings
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."plannings" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "date" DATE NOT NULL,
  "start_time" TIME WITHOUT TIME ZONE NOT NULL,
  "end_time" TIME WITHOUT TIME ZONE,
  "user_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE,
  CONSTRAINT "plannings_time_check" CHECK ("end_time" IS NULL OR "end_time" > "start_time")
);

-- Comments
COMMENT ON TABLE "public"."plannings" IS 'Professional planning/schedule entries';
COMMENT ON COLUMN "public"."plannings"."date" IS 'Date of the planning entry';
COMMENT ON COLUMN "public"."plannings"."start_time" IS 'Start time of the planning entry';
COMMENT ON COLUMN "public"."plannings"."end_time" IS 'End time of the planning entry (optional)';
COMMENT ON COLUMN "public"."plannings"."user_id" IS 'Reference to the professional who owns this planning entry';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_plannings_user_id" ON "public"."plannings" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_plannings_date" ON "public"."plannings" ("date");
CREATE INDEX IF NOT EXISTS "idx_plannings_user_id_date" ON "public"."plannings" ("user_id", "date");

-- Triggers
CREATE TRIGGER update_plannings_updated_at BEFORE UPDATE ON "public"."plannings"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE "public"."plannings" ENABLE ROW LEVEL SECURITY;

-- Everyone can view planning entries (public profile data)
CREATE POLICY "Everyone can view planning entries" ON "public"."plannings"
  FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- Professionals can insert their own planning entries
CREATE POLICY "Professionals can insert their own planning" ON "public"."plannings"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Professionals can update their own planning entries
CREATE POLICY "Professionals can update their own planning" ON "public"."plannings"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Professionals can delete their own planning entries
CREATE POLICY "Professionals can delete their own planning" ON "public"."plannings"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id");

-- ============================================================================
-- Model: reports
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."reports" (
  "id" BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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
