-- Migration: create_tables
-- Purpose: Create all database tables with constraints, indexes, triggers, and RLS policies
-- Affected tables: newsletter_subscriptions, availabilities, profiles, reports
-- Special considerations: All tables have RLS enabled by default for security

-- ============================================================================
-- Model: newsletter_subscriptions
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."newsletter_subscriptions" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT
);

-- Comments
COMMENT ON TABLE "public"."newsletter_subscriptions" IS 'Newsletter subscriptions';
COMMENT ON COLUMN "public"."newsletter_subscriptions"."email" IS 'Subscriber email address';
COMMENT ON COLUMN "public"."newsletter_subscriptions"."name" IS 'Optional subscriber name';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_newsletter_subscriptions_email" ON "public"."newsletter_subscriptions" ("email");

-- RLS
ALTER TABLE "public"."newsletter_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Allow public subscription to newsletter
CREATE POLICY "Allow public to subscribe to newsletter" ON "public"."newsletter_subscriptions"
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
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "is_onboarded" BOOLEAN DEFAULT FALSE NOT NULL
);

-- Comments
COMMENT ON TABLE "public"."profiles" IS 'User profiles';
COMMENT ON COLUMN "public"."profiles"."user_id" IS 'Reference to the user';
COMMENT ON COLUMN "public"."profiles"."role" IS 'User role: professional, structure, or admin';
COMMENT ON COLUMN "public"."profiles"."email" IS 'User email address';
COMMENT ON COLUMN "public"."profiles"."is_onboarded" IS 'Whether the user has completed the onboarding process';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "public"."profiles" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_profiles_role" ON "public"."profiles" ("role");
CREATE INDEX IF NOT EXISTS "idx_profiles_email" ON "public"."profiles" ("email");
CREATE INDEX IF NOT EXISTS "idx_profiles_is_onboarded" ON "public"."profiles" ("is_onboarded");

-- RLS
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

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

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON "public"."profiles"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON "public"."profiles"
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

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles" ON "public"."profiles"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON "public"."profiles"
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
  WITH CHECK ((SELECT auth.uid()) = "user_id");

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
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can update all professionals
CREATE POLICY "Admins can update all professionals" ON "public"."professionals"
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

-- Admins can insert professionals
CREATE POLICY "Admins can insert professionals" ON "public"."professionals"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can delete professionals
CREATE POLICY "Admins can delete professionals" ON "public"."professionals"
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

-- Admins can view all structures
CREATE POLICY "Admins can view all structures" ON "public"."structures"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can update all structures
CREATE POLICY "Admins can update all structures" ON "public"."structures"
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

-- Admins can insert structures
CREATE POLICY "Admins can insert structures" ON "public"."structures"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can delete structures
CREATE POLICY "Admins can delete structures" ON "public"."structures"
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
-- Model: availabilities
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."availabilities" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "rrule" TEXT NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE
);

-- Comments
COMMENT ON TABLE "public"."availabilities" IS 'Professional availability/schedule entries using RRULE (RFC 5545) format';
COMMENT ON COLUMN "public"."availabilities"."rrule" IS 'Complete RRULE string including DTSTART, RRULE, DURATION, and EXDATE (RFC 5545 format)';
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
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can update all reports
CREATE POLICY "Admins can update all reports" ON "public"."reports"
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

-- Admins can insert reports
CREATE POLICY "Admins can insert reports" ON "public"."reports"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can delete reports
CREATE POLICY "Admins can delete reports" ON "public"."reports"
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );
