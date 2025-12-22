-- Migration: create_professional_ratings
-- Purpose: Create professional_ratings table with constraints, indexes, triggers, and RLS policies
-- Affected tables: professional_ratings, professionals
-- Dependencies: Requires professionals, structures, and structure_members tables to exist

-- ============================================================================
-- Model: professional_ratings
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."professional_ratings" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "structure_id" UUID NOT NULL REFERENCES "public"."structures"("user_id") ON DELETE CASCADE,
  "professional_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE,
  "membership_id" UUID NOT NULL REFERENCES "public"."structure_members"("id") ON DELETE CASCADE,
  "rating" NUMERIC(3, 2) NOT NULL,
  "comment" TEXT,
  CONSTRAINT "professional_ratings_rating_check" CHECK ("rating" >= 0 AND "rating" <= 5),
  CONSTRAINT "professional_ratings_unique_membership" UNIQUE ("structure_id", "professional_id", "membership_id")
);

-- Comments
COMMENT ON TABLE "public"."professional_ratings" IS 'Ratings and comments from structures about their professional members. Each rating is tied to a specific membership, allowing re-rating when professionals rejoin.';
COMMENT ON COLUMN "public"."professional_ratings"."structure_id" IS 'Reference to the structure creating the rating';
COMMENT ON COLUMN "public"."professional_ratings"."professional_id" IS 'Reference to the professional being rated';
COMMENT ON COLUMN "public"."professional_ratings"."membership_id" IS 'Reference to the specific membership this rating is for';
COMMENT ON COLUMN "public"."professional_ratings"."rating" IS 'Rating value from 0 to 5';
COMMENT ON COLUMN "public"."professional_ratings"."comment" IS 'Optional comment about the professional';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_professional_ratings_structure_id" ON "public"."professional_ratings" ("structure_id");
CREATE INDEX IF NOT EXISTS "idx_professional_ratings_professional_id" ON "public"."professional_ratings" ("professional_id");
CREATE INDEX IF NOT EXISTS "idx_professional_ratings_membership_id" ON "public"."professional_ratings" ("membership_id");
CREATE INDEX IF NOT EXISTS "idx_professional_ratings_created_at" ON "public"."professional_ratings" ("created_at");

-- Triggers
CREATE TRIGGER update_professional_ratings_updated_at BEFORE UPDATE ON "public"."professional_ratings"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Function: update_professional_rating_stats
-- ============================================================================

-- Function to calculate and update average rating and reviews count for a professional
CREATE OR REPLACE FUNCTION public.update_professional_rating_stats(professional_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  avg_rating NUMERIC;
  total_reviews INTEGER;
BEGIN
  -- Calculate average rating and total count
  SELECT
    COALESCE(AVG("rating"), 0),
    COUNT(*)
  INTO avg_rating, total_reviews
  FROM public.professional_ratings
  WHERE "professional_id" = professional_user_id;

  -- Update professionals table
  UPDATE public.professionals
  SET
    "rating" = avg_rating,
    "reviews_count" = total_reviews,
    "updated_at" = NOW()
  WHERE "user_id" = professional_user_id;
END;
$$;

COMMENT ON FUNCTION public.update_professional_rating_stats(UUID) IS 'Calculates and updates the average rating and reviews count for a professional based on all their ratings.';

-- ============================================================================
-- Function: sync_professional_rating_on_change
-- ============================================================================

-- Trigger function to sync rating stats when ratings change
CREATE OR REPLACE FUNCTION public.sync_professional_rating_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  affected_professional_id UUID;
BEGIN
  -- Determine which professional was affected
  IF TG_OP = 'DELETE' THEN
    affected_professional_id := OLD."professional_id";
  ELSE
    affected_professional_id := NEW."professional_id";
  END IF;

  -- Update the professional's rating stats
  PERFORM public.update_professional_rating_stats(affected_professional_id);

  -- Return appropriate row
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.sync_professional_rating_on_change() IS 'Trigger function that automatically updates professional rating stats when ratings are inserted, updated, or deleted.';

-- ============================================================================
-- Trigger: sync_professional_rating_on_change
-- ============================================================================

CREATE TRIGGER sync_professional_rating_on_change
  AFTER INSERT OR UPDATE OR DELETE ON "public"."professional_ratings"
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_professional_rating_on_change();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE "public"."professional_ratings" ENABLE ROW LEVEL SECURITY;

-- Public can view all ratings
CREATE POLICY "Public can view all ratings" ON "public"."professional_ratings"
  FOR SELECT
  TO authenticated, anon
  USING (TRUE);

-- Structures can create ratings for their active members
CREATE POLICY "Structures can create ratings for active members" ON "public"."professional_ratings"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = "structure_id"
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'structure'
    )
    AND EXISTS (
      SELECT 1
      FROM public.structure_members
      WHERE id = "membership_id"
      AND structure_id = (SELECT auth.uid())
      AND professional_id = "professional_id"
      AND deleted_at IS NULL
    )
  );

-- Structures can update their own ratings
CREATE POLICY "Structures can update their own ratings" ON "public"."professional_ratings"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "structure_id")
  WITH CHECK ((SELECT auth.uid()) = "structure_id");

-- Structures can delete their own ratings
CREATE POLICY "Structures can delete their own ratings" ON "public"."professional_ratings"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "structure_id");

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings" ON "public"."professional_ratings"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all ratings
CREATE POLICY "Admins can update all ratings" ON "public"."professional_ratings"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete all ratings
CREATE POLICY "Admins can delete all ratings" ON "public"."professional_ratings"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

