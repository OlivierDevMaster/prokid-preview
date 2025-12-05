-- Migration: add_id_and_relation_structures_professionals
-- Purpose: Add id UUID columns to structures and professionals tables, and create many-to-many relation table
-- Affected tables: structures, professionals, structures_professionals (new)
-- Note: This migration adds id columns to enable many-to-many relationships

-- ============================================================================
-- Add id column to professionals table
-- ============================================================================

-- Add id column with default UUID generation
ALTER TABLE "public"."professionals"
  ADD COLUMN IF NOT EXISTS "id" UUID DEFAULT gen_random_uuid() NOT NULL;

-- Create unique index on id
CREATE UNIQUE INDEX IF NOT EXISTS "idx_professionals_id" ON "public"."professionals" ("id");

-- Add comment
COMMENT ON COLUMN "public"."professionals"."id" IS 'Unique identifier for the professional record';

-- ============================================================================
-- Add id column to structures table
-- ============================================================================

-- Add id column with default UUID generation
ALTER TABLE "public"."structures"
  ADD COLUMN IF NOT EXISTS "id" UUID DEFAULT gen_random_uuid() NOT NULL;

-- Create unique index on id
CREATE UNIQUE INDEX IF NOT EXISTS "idx_structures_id" ON "public"."structures" ("id");

-- Add comment
COMMENT ON COLUMN "public"."structures"."id" IS 'Unique identifier for the structure record';

-- ============================================================================
-- Create junction table for many-to-many relationship
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."structures_professionals" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "structure_id" UUID NOT NULL REFERENCES "public"."structures"("id") ON DELETE CASCADE,
  "professional_id" UUID NOT NULL REFERENCES "public"."professionals"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "structures_professionals_unique" UNIQUE ("structure_id", "professional_id")
);

-- Comments
COMMENT ON TABLE "public"."structures_professionals" IS 'Junction table for many-to-many relationship between structures and professionals';
COMMENT ON COLUMN "public"."structures_professionals"."structure_id" IS 'Reference to the structure id';
COMMENT ON COLUMN "public"."structures_professionals"."professional_id" IS 'Reference to the professional id';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_structures_professionals_structure_id" ON "public"."structures_professionals" ("structure_id");
CREATE INDEX IF NOT EXISTS "idx_structures_professionals_professional_id" ON "public"."structures_professionals" ("professional_id");

-- Triggers
CREATE TRIGGER update_structures_professionals_updated_at BEFORE UPDATE ON "public"."structures_professionals"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE "public"."structures_professionals" ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own relationships
-- Structure owners can link professionals to their structure
CREATE POLICY "Structure owners can link professionals" ON "public"."structures_professionals"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.structures
      WHERE id = structure_id
      AND user_id = (SELECT auth.uid())
    )
  );

-- Authenticated users can update their own relationships
CREATE POLICY "Structure owners can update their relationships" ON "public"."structures_professionals"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.structures
      WHERE id = structure_id
      AND user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.structures
      WHERE id = structure_id
      AND user_id = (SELECT auth.uid())
    )
  );

-- Authenticated users can delete their own relationships
CREATE POLICY "Structure owners can delete their relationships" ON "public"."structures_professionals"
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.structures
      WHERE id = structure_id
      AND user_id = (SELECT auth.uid())
    )
  );

-- Admins can view all relationships
CREATE POLICY "Admins can view all relationships" ON "public"."structures_professionals"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can insert relationships
CREATE POLICY "Admins can insert relationships" ON "public"."structures_professionals"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Admins can update all relationships
CREATE POLICY "Admins can update all relationships" ON "public"."structures_professionals"
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

-- Admins can delete all relationships
CREATE POLICY "Admins can delete all relationships" ON "public"."structures_professionals"
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

