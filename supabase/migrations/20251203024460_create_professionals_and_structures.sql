-- Migration: create_professionals_and_structures
-- Purpose: Create professionals and structures tables with constraints, indexes, triggers, and RLS policies
-- Affected tables: professionals, structures
-- Dependencies: Requires profiles table to exist

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
  "phone" TEXT,
  "description" TEXT,
  "current_job" TEXT,
  "experience_years" NUMERIC NOT NULL,
  "hourly_rate" NUMERIC(10, 2) NOT NULL,
  "verified_at" TIMESTAMP WITH TIME ZONE,
  "is_available" BOOLEAN DEFAULT TRUE NOT NULL,
  "rating" NUMERIC DEFAULT 0,
  "reviews_count" INTEGER DEFAULT 0 NOT NULL,
  "skills" TEXT[],
  "is_certified" BOOLEAN DEFAULT FALSE NOT NULL,
  "stripe_customer_id" TEXT,
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
COMMENT ON COLUMN "public"."professionals"."phone" IS 'Professional contact phone number';
COMMENT ON COLUMN "public"."professionals"."description" IS 'Professional description or bio';
COMMENT ON COLUMN "public"."professionals"."current_job" IS 'Current job title or position';
COMMENT ON COLUMN "public"."professionals"."experience_years" IS 'Years of professional experience';
COMMENT ON COLUMN "public"."professionals"."hourly_rate" IS 'Hourly rate in currency';
COMMENT ON COLUMN "public"."professionals"."verified_at" IS 'Timestamp when the professional was verified';
COMMENT ON COLUMN "public"."professionals"."is_available" IS 'Whether the professional is currently available for work';
COMMENT ON COLUMN "public"."professionals"."rating" IS 'Average rating from reviews (0-5)';
COMMENT ON COLUMN "public"."professionals"."reviews_count" IS 'Total number of reviews received';
COMMENT ON COLUMN "public"."professionals"."skills" IS 'Array of professional skills or specializations';
COMMENT ON COLUMN "public"."professionals"."is_certified" IS 'Whether the professional has certifications';
COMMENT ON COLUMN "public"."professionals"."stripe_customer_id" IS 'Stripe customer ID for payment processing';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_professionals_user_id" ON "public"."professionals" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_professionals_city" ON "public"."professionals" ("city");
CREATE INDEX IF NOT EXISTS "idx_professionals_postal_code" ON "public"."professionals" ("postal_code");
CREATE INDEX IF NOT EXISTS "idx_professionals_is_available" ON "public"."professionals" ("is_available");
CREATE INDEX IF NOT EXISTS "idx_professionals_is_certified" ON "public"."professionals" ("is_certified");
CREATE INDEX IF NOT EXISTS "idx_professionals_rating" ON "public"."professionals" ("rating");
CREATE INDEX IF NOT EXISTS "idx_professionals_stripe_customer_id" ON "public"."professionals" ("stripe_customer_id");

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

-- Users can create their own professional profile
CREATE POLICY "Users can create their own professional profile" ON "public"."professionals"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = "user_id"
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'professional'
    )
  );

-- Users can update their own professional profile
CREATE POLICY "Users can update their own professional profile" ON "public"."professionals"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Admins can view all professionals
CREATE POLICY "Admins can view all professionals" ON "public"."professionals"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all professionals
CREATE POLICY "Admins can update all professionals" ON "public"."professionals"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can insert professionals
CREATE POLICY "Admins can insert professionals" ON "public"."professionals"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete professionals
CREATE POLICY "Admins can delete professionals" ON "public"."professionals"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- Model: structures
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."structures" (
  "user_id" UUID NOT NULL PRIMARY KEY REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "name" TEXT NOT NULL,
  "stripe_customer_id" TEXT
);

-- Comments
COMMENT ON TABLE "public"."structures" IS 'Structure user profiles';
COMMENT ON COLUMN "public"."structures"."user_id" IS 'Reference to the profile user';
COMMENT ON COLUMN "public"."structures"."name" IS 'Structure name';
COMMENT ON COLUMN "public"."structures"."stripe_customer_id" IS 'Stripe customer ID for payment processing';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_structures_user_id" ON "public"."structures" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_structures_name" ON "public"."structures" ("name");
CREATE INDEX IF NOT EXISTS "idx_structures_stripe_customer_id" ON "public"."structures" ("stripe_customer_id");

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
  WITH CHECK (
    (SELECT auth.uid()) = "user_id"
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'structure'
    )
  );

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

-- Admins can view all structures
CREATE POLICY "Admins can view all structures" ON "public"."structures"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all structures
CREATE POLICY "Admins can update all structures" ON "public"."structures"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can insert structures
CREATE POLICY "Admins can insert structures" ON "public"."structures"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete structures
CREATE POLICY "Admins can delete structures" ON "public"."structures"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

