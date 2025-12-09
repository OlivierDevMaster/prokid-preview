-- Migration: create_base_tables
-- Purpose: Create base tables (newsletter_subscriptions, profiles) with constraints, indexes, and RLS policies
-- Affected tables: newsletter_subscriptions, profiles
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

-- Admins can view all newsletter subscriptions
CREATE POLICY "Admins can view all newsletter subscriptions" ON "public"."newsletter_subscriptions"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update newsletter subscriptions
CREATE POLICY "Admins can update newsletter subscriptions" ON "public"."newsletter_subscriptions"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete newsletter subscriptions
CREATE POLICY "Admins can delete newsletter subscriptions" ON "public"."newsletter_subscriptions"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

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
  "preferred_language" "public"."locale" DEFAULT 'fr' NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "is_onboarded" BOOLEAN DEFAULT FALSE NOT NULL
);

-- Comments
COMMENT ON TABLE "public"."profiles" IS 'User profiles';
COMMENT ON COLUMN "public"."profiles"."user_id" IS 'Reference to the user';
COMMENT ON COLUMN "public"."profiles"."role" IS 'User role: professional, structure, or admin';
COMMENT ON COLUMN "public"."profiles"."email" IS 'User email address';
COMMENT ON COLUMN "public"."profiles"."preferred_language" IS 'User preferred language: en or fr';
COMMENT ON COLUMN "public"."profiles"."is_onboarded" IS 'Whether the user has completed the onboarding process';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "public"."profiles" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_profiles_role" ON "public"."profiles" ("role");
CREATE INDEX IF NOT EXISTS "idx_profiles_email" ON "public"."profiles" ("email");
CREATE INDEX IF NOT EXISTS "idx_profiles_preferred_language" ON "public"."profiles" ("preferred_language");
CREATE INDEX IF NOT EXISTS "idx_profiles_is_onboarded" ON "public"."profiles" ("is_onboarded");

-- RLS
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- Anyone can view all profiles
CREATE POLICY "Anyone can view all profiles" ON "public"."profiles"
  FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON "public"."profiles"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON "public"."profiles"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON "public"."profiles"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id");

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON "public"."profiles"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

