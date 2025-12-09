-- Migration: create_structure_invitations_and_members
-- Purpose: Create structure_invitations and structure_members tables with constraints, indexes, triggers, RLS policies, and invitation handling function
-- Affected tables: structure_invitations, structure_members
-- Dependencies: Requires professionals and structures tables to exist

-- ============================================================================
-- Model: structure_invitations
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."structure_invitations" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "structure_id" UUID NOT NULL REFERENCES "public"."structures"("user_id") ON DELETE CASCADE,
  "professional_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE,
  "status" "public"."invitation_status" DEFAULT 'pending' NOT NULL
);

-- Comments
COMMENT ON TABLE "public"."structure_invitations" IS 'Invitations sent by structures to professionals to join their organization';
COMMENT ON COLUMN "public"."structure_invitations"."structure_id" IS 'Reference to the structure sending the invitation';
COMMENT ON COLUMN "public"."structure_invitations"."professional_id" IS 'Reference to the professional receiving the invitation';
COMMENT ON COLUMN "public"."structure_invitations"."status" IS 'Current status of the invitation: pending, accepted, or declined';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_structure_invitations_structure_id" ON "public"."structure_invitations" ("structure_id");
CREATE INDEX IF NOT EXISTS "idx_structure_invitations_professional_id" ON "public"."structure_invitations" ("professional_id");
CREATE INDEX IF NOT EXISTS "idx_structure_invitations_status" ON "public"."structure_invitations" ("status");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_structure_invitations_unique_pending" ON "public"."structure_invitations" ("structure_id", "professional_id") WHERE "status" = 'pending';

-- Triggers
CREATE TRIGGER update_structure_invitations_updated_at BEFORE UPDATE ON "public"."structure_invitations"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Function: prevent_invitation_status_rollback
-- ============================================================================

-- Function to prevent status changes from accepted/declined back to pending
CREATE OR REPLACE FUNCTION "public"."prevent_invitation_status_rollback"()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent changing status from 'accepted' or 'declined' back to 'pending'
  IF (OLD."status" = 'accepted' OR OLD."status" = 'declined') AND NEW."status" = 'pending' THEN
    RAISE EXCEPTION 'Cannot change invitation status from % to pending. Once an invitation is accepted or declined, it cannot be reverted to pending.', OLD."status";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."prevent_invitation_status_rollback"() IS 'Prevents changing invitation status from accepted or declined back to pending';

-- Trigger to prevent status rollback
CREATE TRIGGER "trigger_prevent_invitation_status_rollback"
  BEFORE UPDATE OF "status" ON "public"."structure_invitations"
  FOR EACH ROW
  WHEN (OLD."status" IS DISTINCT FROM NEW."status")
  EXECUTE FUNCTION "public"."prevent_invitation_status_rollback"();

-- RLS
ALTER TABLE "public"."structure_invitations" ENABLE ROW LEVEL SECURITY;

-- Structures can view invitations they sent
CREATE POLICY "Structures can view invitations they sent" ON "public"."structure_invitations"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "structure_id");

-- Professionals can view invitations they received
CREATE POLICY "Professionals can view invitations they received" ON "public"."structure_invitations"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "professional_id");

-- Structures can create invitations to professionals
CREATE POLICY "Structures can create invitations" ON "public"."structure_invitations"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = "structure_id"
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'structure'
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = "professional_id"
      AND role = 'professional'
    )
  );

-- Professionals can update invitations they received (to accept or decline)
CREATE POLICY "Professionals can update invitations they received" ON "public"."structure_invitations"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "professional_id")
  WITH CHECK (
    (SELECT auth.uid()) = "professional_id"
    AND ("status" = 'accepted' OR "status" = 'declined')
  );

-- Structures can update invitations they sent (to cancel pending invitations)
CREATE POLICY "Structures can update invitations they sent" ON "public"."structure_invitations"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "structure_id")
  WITH CHECK ((SELECT auth.uid()) = "structure_id");

-- Structures can delete invitations they sent
CREATE POLICY "Structures can delete invitations they sent" ON "public"."structure_invitations"
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = "structure_id");

-- Admins can view all structure invitations
CREATE POLICY "Admins can view all structure invitations" ON "public"."structure_invitations"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all structure invitations
CREATE POLICY "Admins can update all structure invitations" ON "public"."structure_invitations"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can insert structure invitations
CREATE POLICY "Admins can insert structure invitations" ON "public"."structure_invitations"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can delete structure invitations
CREATE POLICY "Admins can delete structure invitations" ON "public"."structure_invitations"
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- Model: structure_members
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."structure_members" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "structure_id" UUID NOT NULL REFERENCES "public"."structures"("user_id") ON DELETE CASCADE,
  "professional_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE,
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- Comments
COMMENT ON TABLE "public"."structure_members" IS 'Many-to-many relationship between structures and professionals. Represents professionals who are members of structures';
COMMENT ON COLUMN "public"."structure_members"."structure_id" IS 'Reference to the structure';
COMMENT ON COLUMN "public"."structure_members"."professional_id" IS 'Reference to the professional member';
COMMENT ON COLUMN "public"."structure_members"."deleted_at" IS 'Timestamp when the membership was soft deleted. NULL means the membership is active';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_structure_members_structure_id" ON "public"."structure_members" ("structure_id");
CREATE INDEX IF NOT EXISTS "idx_structure_members_professional_id" ON "public"."structure_members" ("professional_id");
CREATE INDEX IF NOT EXISTS "idx_structure_members_deleted_at" ON "public"."structure_members" ("deleted_at");
-- Partial unique index: only one active membership per structure-professional pair
CREATE UNIQUE INDEX IF NOT EXISTS "idx_structure_members_unique_active" ON "public"."structure_members" ("structure_id", "professional_id") WHERE "deleted_at" IS NULL;

-- Triggers
CREATE TRIGGER update_structure_members_updated_at BEFORE UPDATE ON "public"."structure_members"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE "public"."structure_members" ENABLE ROW LEVEL SECURITY;

-- Structures can view their members (including past members for GDPR compliance)
CREATE POLICY "Structures can view their members" ON "public"."structure_members"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "structure_id");

-- Professionals can view structures they belong to (including past memberships for GDPR compliance)
CREATE POLICY "Professionals can view structures they belong to" ON "public"."structure_members"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "professional_id");

-- Structures can add members (when invitation is accepted, via trigger)
CREATE POLICY "Structures can add members" ON "public"."structure_members"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = "structure_id"
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = (SELECT auth.uid())
      AND role = 'structure'
    )
  );

-- Structures can soft delete members (set deleted_at)
CREATE POLICY "Structures can remove members" ON "public"."structure_members"
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = "structure_id"
    AND "deleted_at" IS NULL
  )
  WITH CHECK (
    (SELECT auth.uid()) = "structure_id"
    AND "deleted_at" IS NOT NULL
  );

-- Professionals can leave structures (soft delete)
CREATE POLICY "Professionals can leave structures" ON "public"."structure_members"
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = "professional_id"
    AND "deleted_at" IS NULL
  )
  WITH CHECK (
    (SELECT auth.uid()) = "professional_id"
    AND "deleted_at" IS NOT NULL
  );

-- Admins can view all memberships (including deleted)
CREATE POLICY "Admins can view all memberships" ON "public"."structure_members"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all memberships
CREATE POLICY "Admins can update all memberships" ON "public"."structure_members"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can insert memberships
CREATE POLICY "Admins can insert memberships" ON "public"."structure_members"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can soft delete memberships
CREATE POLICY "Admins can delete memberships" ON "public"."structure_members"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- ============================================================================
-- Function: handle_invitation_accepted
-- ============================================================================

-- Function to automatically create membership when invitation is accepted
CREATE OR REPLACE FUNCTION "public"."handle_invitation_accepted"()
RETURNS TRIGGER AS $$
DECLARE
  existing_membership_id UUID;
BEGIN
  -- When an invitation status changes to 'accepted', create a new membership
  IF NEW."status" = 'accepted' AND (OLD."status" IS NULL OR OLD."status" != 'accepted') THEN
    -- Check if an active membership already exists
    SELECT "id" INTO existing_membership_id
    FROM "public"."structure_members"
    WHERE "structure_id" = NEW."structure_id"
      AND "professional_id" = NEW."professional_id"
      AND "deleted_at" IS NULL;

    -- If no active membership exists, create a new one
    -- Old soft-deleted memberships remain as history and are not restored
    IF existing_membership_id IS NULL THEN
      INSERT INTO "public"."structure_members" ("structure_id", "professional_id")
      VALUES (NEW."structure_id", NEW."professional_id");
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."handle_invitation_accepted"() IS 'Automatically creates a new structure membership when an invitation is accepted. Previous soft-deleted memberships remain as history';

-- Trigger to call the function when invitation status changes
CREATE TRIGGER "trigger_handle_invitation_accepted"
  AFTER UPDATE OF "status" ON "public"."structure_invitations"
  FOR EACH ROW
  WHEN (NEW."status" = 'accepted' AND (OLD."status" IS NULL OR OLD."status" != 'accepted'))
  EXECUTE FUNCTION "public"."handle_invitation_accepted"();

