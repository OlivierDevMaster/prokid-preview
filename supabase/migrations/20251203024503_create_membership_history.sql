-- Migration: create_membership_history
-- Purpose: Create structure_membership_history table and logging functions for membership events
-- Affected tables: structure_membership_history
-- Dependencies: Requires structure_members table to exist

-- ============================================================================
-- Model: structure_membership_history
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."structure_membership_history" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "membership_id" UUID NOT NULL REFERENCES "public"."structure_members"("id") ON DELETE CASCADE,
  "structure_id" UUID NOT NULL REFERENCES "public"."structures"("user_id") ON DELETE CASCADE,
  "professional_id" UUID NOT NULL REFERENCES "public"."professionals"("user_id") ON DELETE CASCADE,
  "action" "public"."membership_action" NOT NULL,
  "initiated_by" UUID NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "initiated_by_role" "public"."role" NOT NULL
);

-- Comments
COMMENT ON TABLE "public"."structure_membership_history" IS 'Audit trail of all membership events: joins, leaves, and removals';
COMMENT ON COLUMN "public"."structure_membership_history"."membership_id" IS 'Reference to the membership record';
COMMENT ON COLUMN "public"."structure_membership_history"."structure_id" IS 'Reference to the structure';
COMMENT ON COLUMN "public"."structure_membership_history"."professional_id" IS 'Reference to the professional';
COMMENT ON COLUMN "public"."structure_membership_history"."action" IS 'Action type: joined, left, removed_by_structure, removed_by_admin';
COMMENT ON COLUMN "public"."structure_membership_history"."initiated_by" IS 'User ID of who initiated the action';
COMMENT ON COLUMN "public"."structure_membership_history"."initiated_by_role" IS 'Role of who initiated the action';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_structure_membership_history_membership_id" ON "public"."structure_membership_history" ("membership_id");
CREATE INDEX IF NOT EXISTS "idx_structure_membership_history_structure_id" ON "public"."structure_membership_history" ("structure_id");
CREATE INDEX IF NOT EXISTS "idx_structure_membership_history_professional_id" ON "public"."structure_membership_history" ("professional_id");
CREATE INDEX IF NOT EXISTS "idx_structure_membership_history_created_at" ON "public"."structure_membership_history" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_structure_membership_history_action" ON "public"."structure_membership_history" ("action");

-- RLS
ALTER TABLE "public"."structure_membership_history" ENABLE ROW LEVEL SECURITY;

-- Structures can view history of their memberships
CREATE POLICY "Structures can view their membership history" ON "public"."structure_membership_history"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "structure_id");

-- Professionals can view history of their memberships
CREATE POLICY "Professionals can view their membership history" ON "public"."structure_membership_history"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "professional_id");

-- Admins can view all membership history
CREATE POLICY "Admins can view all membership history" ON "public"."structure_membership_history"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- History table is insert-only (no updates or deletes allowed)
-- Only triggers can insert into this table

-- ============================================================================
-- Function: log_membership_joined
-- ============================================================================

-- Function to log when a membership is created
CREATE OR REPLACE FUNCTION "public"."log_membership_joined"()
RETURNS TRIGGER AS $$
DECLARE
  initiator_id UUID;
  initiator_role "public"."role";
BEGIN
  -- Get the initiator (who accepted the invitation - the professional)
  initiator_id := NEW."professional_id";

  -- Get the role of the initiator
  SELECT "role" INTO initiator_role
  FROM "public"."profiles"
  WHERE "user_id" = initiator_id;

  -- Log the join event
  INSERT INTO "public"."structure_membership_history" (
    "membership_id",
    "structure_id",
    "professional_id",
    "action",
    "initiated_by",
    "initiated_by_role"
  )
  VALUES (
    NEW."id",
    NEW."structure_id",
    NEW."professional_id",
    'joined',
    initiator_id,
    initiator_role
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."log_membership_joined"() IS 'Logs when a professional joins a structure (membership created)';

-- Trigger to log membership creation
CREATE TRIGGER "trigger_log_membership_joined"
  AFTER INSERT ON "public"."structure_members"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."log_membership_joined"();

-- ============================================================================
-- Function: log_membership_left
-- ============================================================================

-- Function to log when a membership is soft deleted (left or removed)
CREATE OR REPLACE FUNCTION "public"."log_membership_left"()
RETURNS TRIGGER AS $$
DECLARE
  initiator_id UUID;
  initiator_role "public"."role";
  action_type "public"."membership_action";
BEGIN
  -- Only log if deleted_at changed from NULL to a timestamp (soft delete)
  IF OLD."deleted_at" IS NULL AND NEW."deleted_at" IS NOT NULL THEN
    -- Determine who initiated the action based on who is making the update
    initiator_id := (SELECT auth.uid());

    -- Get the role of the initiator
    SELECT "role" INTO initiator_role
    FROM "public"."profiles"
    WHERE "user_id" = initiator_id;

    -- Determine action type based on who initiated
    IF initiator_id = NEW."structure_id" THEN
      action_type := 'removed_by_structure';
    ELSIF initiator_id = NEW."professional_id" THEN
      action_type := 'left';
    ELSIF initiator_role = 'admin' THEN
      action_type := 'removed_by_admin';
    ELSE
      -- Fallback: assume professional left (most common case)
      action_type := 'left';
      initiator_id := NEW."professional_id";
      initiator_role := 'professional';
    END IF;

    -- Log the leave/removal event
    INSERT INTO "public"."structure_membership_history" (
      "membership_id",
      "structure_id",
      "professional_id",
      "action",
      "initiated_by",
      "initiated_by_role"
    )
    VALUES (
      NEW."id",
      NEW."structure_id",
      NEW."professional_id",
      action_type,
      initiator_id,
      initiator_role
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."log_membership_left"() IS 'Logs when a professional leaves or is removed from a structure (soft delete)';

-- Trigger to log membership soft delete
CREATE TRIGGER "trigger_log_membership_left"
  AFTER UPDATE OF "deleted_at" ON "public"."structure_members"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."log_membership_left"();

