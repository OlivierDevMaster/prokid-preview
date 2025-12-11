-- Migration: create_notifications
-- Purpose: Create notifications table with enum type, indexes, triggers, and RLS policies
-- Affected tables: notifications
-- Dependencies: Requires profiles, structures, professionals, structure_invitations, structure_members, missions, and reports tables to exist

-- ============================================================================
-- Enum: notification_type
-- ============================================================================

CREATE TYPE "public"."notification_type" AS ENUM (
  'invitation_received',
  'invitation_accepted',
  'invitation_declined',
  'member_quit',
  'member_fired',
  'mission_received',
  'mission_accepted',
  'mission_declined',
  'mission_cancelled',
  'report_sent'
);

COMMENT ON TYPE "public"."notification_type" IS 'Types of notifications that can be sent to users';

-- ============================================================================
-- Model: notifications
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."notifications" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "type" "public"."notification_type" NOT NULL,
  "recipient_id" UUID NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "recipient_role" "public"."role" NOT NULL,
  "data" JSONB NOT NULL,
  "read_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "notifications_recipient_role_valid" CHECK ("recipient_role" IN ('professional', 'structure'))
);

-- Comments
COMMENT ON TABLE "public"."notifications" IS 'Notifications sent to users for various events. Uses type enum and JSONB data for multilingual support.';
COMMENT ON COLUMN "public"."notifications"."type" IS 'Type of notification (determines the structure of the data field)';
COMMENT ON COLUMN "public"."notifications"."recipient_id" IS 'User ID of the notification recipient';
COMMENT ON COLUMN "public"."notifications"."recipient_role" IS 'Role of the recipient (professional or structure)';
COMMENT ON COLUMN "public"."notifications"."data" IS 'JSONB data containing notification-specific information (IDs, names, etc.)';
COMMENT ON COLUMN "public"."notifications"."read_at" IS 'Timestamp when the notification was marked as read (NULL if unread)';
COMMENT ON COLUMN "public"."notifications"."created_at" IS 'Timestamp when the notification was created';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_notifications_recipient_id" ON "public"."notifications" ("recipient_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_recipient_role" ON "public"."notifications" ("recipient_role");
CREATE INDEX IF NOT EXISTS "idx_notifications_type" ON "public"."notifications" ("type");
CREATE INDEX IF NOT EXISTS "idx_notifications_read_at" ON "public"."notifications" ("read_at");
CREATE INDEX IF NOT EXISTS "idx_notifications_recipient_unread" ON "public"."notifications" ("recipient_id", "read_at");

-- RLS
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON "public"."notifications"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "recipient_id");

-- Users can update their own notifications (to mark as read)
CREATE POLICY "Users can update their own notifications" ON "public"."notifications"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "recipient_id")
  WITH CHECK ((SELECT auth.uid()) = "recipient_id");

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON "public"."notifications"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all notifications
CREATE POLICY "Admins can update all notifications" ON "public"."notifications"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- ============================================================================
-- Function: create_invitation_received_notification
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."create_invitation_received_notification"()
RETURNS TRIGGER AS $$
DECLARE
  structure_name TEXT;
BEGIN
  -- Only create notification for pending invitations
  IF NEW."status" = 'pending' THEN
    -- Get structure name
    SELECT "name" INTO structure_name
    FROM "public"."structures"
    WHERE "user_id" = NEW."structure_id";

    -- Create notification for the professional
    INSERT INTO "public"."notifications" (
      "type",
      "recipient_id",
      "recipient_role",
      "data"
    )
    VALUES (
      'invitation_received',
      NEW."professional_id",
      'professional',
      jsonb_build_object(
        'structure_id', NEW."structure_id",
        'structure_name', structure_name,
        'invitation_id', NEW."id"
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."create_invitation_received_notification"() IS 'Creates a notification when a professional receives a structure invitation';

-- Trigger for invitation received
CREATE TRIGGER "trigger_create_invitation_received_notification"
  AFTER INSERT ON "public"."structure_invitations"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."create_invitation_received_notification"();

-- ============================================================================
-- Function: create_invitation_accepted_notification
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."create_invitation_accepted_notification"()
RETURNS TRIGGER AS $$
DECLARE
  professional_first_name TEXT;
  professional_last_name TEXT;
  professional_name TEXT;
BEGIN
  -- Only create notification when status changes to accepted
  IF NEW."status" = 'accepted' AND (OLD."status" IS NULL OR OLD."status" != 'accepted') THEN
    -- Get professional name from profile
    SELECT "first_name", "last_name" INTO professional_first_name, professional_last_name
    FROM "public"."profiles"
    WHERE "user_id" = NEW."professional_id";

    -- Build full name
    professional_name := COALESCE(professional_first_name || ' ', '') || COALESCE(professional_last_name, '');

    -- Create notification for the structure
    INSERT INTO "public"."notifications" (
      "type",
      "recipient_id",
      "recipient_role",
      "data"
    )
    VALUES (
      'invitation_accepted',
      NEW."structure_id",
      'structure',
      jsonb_build_object(
        'professional_id', NEW."professional_id",
        'professional_name', professional_name,
        'invitation_id', NEW."id"
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."create_invitation_accepted_notification"() IS 'Creates a notification when a structure invitation is accepted by a professional';

-- Trigger for invitation accepted
CREATE TRIGGER "trigger_create_invitation_accepted_notification"
  AFTER UPDATE OF "status" ON "public"."structure_invitations"
  FOR EACH ROW
  WHEN (NEW."status" = 'accepted' AND (OLD."status" IS NULL OR OLD."status" != 'accepted'))
  EXECUTE FUNCTION "public"."create_invitation_accepted_notification"();

-- ============================================================================
-- Function: create_invitation_declined_notification
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."create_invitation_declined_notification"()
RETURNS TRIGGER AS $$
DECLARE
  professional_first_name TEXT;
  professional_last_name TEXT;
  professional_name TEXT;
BEGIN
  -- Only create notification when status changes to declined
  IF NEW."status" = 'declined' AND (OLD."status" IS NULL OR OLD."status" != 'declined') THEN
    -- Get professional name from profile
    SELECT "first_name", "last_name" INTO professional_first_name, professional_last_name
    FROM "public"."profiles"
    WHERE "user_id" = NEW."professional_id";

    -- Build full name
    professional_name := COALESCE(professional_first_name || ' ', '') || COALESCE(professional_last_name, '');

    -- Create notification for the structure
    INSERT INTO "public"."notifications" (
      "type",
      "recipient_id",
      "recipient_role",
      "data"
    )
    VALUES (
      'invitation_declined',
      NEW."structure_id",
      'structure',
      jsonb_build_object(
        'professional_id', NEW."professional_id",
        'professional_name', professional_name,
        'invitation_id', NEW."id"
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."create_invitation_declined_notification"() IS 'Creates a notification when a structure invitation is declined by a professional';

-- Trigger for invitation declined
CREATE TRIGGER "trigger_create_invitation_declined_notification"
  AFTER UPDATE OF "status" ON "public"."structure_invitations"
  FOR EACH ROW
  WHEN (NEW."status" = 'declined' AND (OLD."status" IS NULL OR OLD."status" != 'declined'))
  EXECUTE FUNCTION "public"."create_invitation_declined_notification"();

-- ============================================================================
-- Function: create_member_quit_notification
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."create_member_quit_notification"()
RETURNS TRIGGER AS $$
DECLARE
  professional_first_name TEXT;
  professional_last_name TEXT;
  professional_name TEXT;
  initiator_id UUID;
BEGIN
  -- Only create notification when deleted_at changes from NULL to a timestamp
  IF OLD."deleted_at" IS NULL AND NEW."deleted_at" IS NOT NULL THEN
    -- Get the initiator (who is making the update)
    initiator_id := (SELECT auth.uid());

    -- Only create notification if professional initiated the leave (quit)
    IF initiator_id = NEW."professional_id" THEN
      -- Get professional name from profile
      SELECT "first_name", "last_name" INTO professional_first_name, professional_last_name
      FROM "public"."profiles"
      WHERE "user_id" = NEW."professional_id";

      -- Build full name
      professional_name := COALESCE(professional_first_name || ' ', '') || COALESCE(professional_last_name, '');

      -- Create notification for the structure
      INSERT INTO "public"."notifications" (
        "type",
        "recipient_id",
        "recipient_role",
        "data"
      )
      VALUES (
        'member_quit',
        NEW."structure_id",
        'structure',
        jsonb_build_object(
          'professional_id', NEW."professional_id",
          'professional_name', professional_name,
          'structure_id', NEW."structure_id"
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."create_member_quit_notification"() IS 'Creates a notification when a professional quits/leaves a structure';

-- Trigger for member quit
CREATE TRIGGER "trigger_create_member_quit_notification"
  AFTER UPDATE OF "deleted_at" ON "public"."structure_members"
  FOR EACH ROW
  WHEN (OLD."deleted_at" IS NULL AND NEW."deleted_at" IS NOT NULL)
  EXECUTE FUNCTION "public"."create_member_quit_notification"();

-- ============================================================================
-- Function: create_member_fired_notification
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."create_member_fired_notification"()
RETURNS TRIGGER AS $$
DECLARE
  professional_first_name TEXT;
  professional_last_name TEXT;
  professional_name TEXT;
  initiator_id UUID;
BEGIN
  -- Only create notification when deleted_at changes from NULL to a timestamp
  IF OLD."deleted_at" IS NULL AND NEW."deleted_at" IS NOT NULL THEN
    -- Get the initiator (who is making the update)
    initiator_id := (SELECT auth.uid());

    -- Only create notification if structure initiated the removal (fired)
    IF initiator_id = NEW."structure_id" THEN
      -- Get professional name from profile
      SELECT "first_name", "last_name" INTO professional_first_name, professional_last_name
      FROM "public"."profiles"
      WHERE "user_id" = NEW."professional_id";

      -- Build full name
      professional_name := COALESCE(professional_first_name || ' ', '') || COALESCE(professional_last_name, '');

      -- Create notification for the professional (they were fired)
      INSERT INTO "public"."notifications" (
        "type",
        "recipient_id",
        "recipient_role",
        "data"
      )
      VALUES (
        'member_fired',
        NEW."professional_id",
        'professional',
        jsonb_build_object(
          'professional_id', NEW."professional_id",
          'professional_name', professional_name,
          'structure_id', NEW."structure_id"
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."create_member_fired_notification"() IS 'Creates a notification when a professional is fired/removed by a structure';

-- Trigger for member fired
CREATE TRIGGER "trigger_create_member_fired_notification"
  AFTER UPDATE OF "deleted_at" ON "public"."structure_members"
  FOR EACH ROW
  WHEN (OLD."deleted_at" IS NULL AND NEW."deleted_at" IS NOT NULL)
  EXECUTE FUNCTION "public"."create_member_fired_notification"();

-- ============================================================================
-- Function: create_mission_received_notification
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."create_mission_received_notification"()
RETURNS TRIGGER AS $$
DECLARE
  structure_name TEXT;
BEGIN
  -- Get structure name
  SELECT "name" INTO structure_name
  FROM "public"."structures"
  WHERE "user_id" = NEW."structure_id";

  -- Create notification for the professional
  INSERT INTO "public"."notifications" (
    "type",
    "recipient_id",
    "recipient_role",
    "data"
  )
  VALUES (
    'mission_received',
    NEW."professional_id",
    'professional',
    jsonb_build_object(
      'mission_id', NEW."id",
      'mission_title', NEW."title",
      'structure_id', NEW."structure_id",
      'structure_name', structure_name
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."create_mission_received_notification"() IS 'Creates a notification when a professional receives a new mission';

-- Trigger for mission received
CREATE TRIGGER "trigger_create_mission_received_notification"
  AFTER INSERT ON "public"."missions"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."create_mission_received_notification"();

-- ============================================================================
-- Function: create_mission_accepted_notification
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."create_mission_accepted_notification"()
RETURNS TRIGGER AS $$
DECLARE
  professional_first_name TEXT;
  professional_last_name TEXT;
  professional_name TEXT;
BEGIN
  -- Only create notification when status changes to accepted
  IF NEW."status" = 'accepted' AND (OLD."status" IS NULL OR OLD."status" != 'accepted') THEN
    -- Get professional name from profile
    SELECT "first_name", "last_name" INTO professional_first_name, professional_last_name
    FROM "public"."profiles"
    WHERE "user_id" = NEW."professional_id";

    -- Build full name
    professional_name := COALESCE(professional_first_name || ' ', '') || COALESCE(professional_last_name, '');

    -- Create notification for the structure
    INSERT INTO "public"."notifications" (
      "type",
      "recipient_id",
      "recipient_role",
      "data"
    )
    VALUES (
      'mission_accepted',
      NEW."structure_id",
      'structure',
      jsonb_build_object(
        'mission_id', NEW."id",
        'mission_title', NEW."title",
        'professional_id', NEW."professional_id",
        'professional_name', professional_name
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."create_mission_accepted_notification"() IS 'Creates a notification when a mission is accepted by a professional';

-- Trigger for mission accepted
CREATE TRIGGER "trigger_create_mission_accepted_notification"
  AFTER UPDATE OF "status" ON "public"."missions"
  FOR EACH ROW
  WHEN (NEW."status" = 'accepted' AND (OLD."status" IS NULL OR OLD."status" != 'accepted'))
  EXECUTE FUNCTION "public"."create_mission_accepted_notification"();

-- ============================================================================
-- Function: create_mission_declined_notification
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."create_mission_declined_notification"()
RETURNS TRIGGER AS $$
DECLARE
  professional_first_name TEXT;
  professional_last_name TEXT;
  professional_name TEXT;
BEGIN
  -- Only create notification when status changes to declined
  IF NEW."status" = 'declined' AND (OLD."status" IS NULL OR OLD."status" != 'declined') THEN
    -- Get professional name from profile
    SELECT "first_name", "last_name" INTO professional_first_name, professional_last_name
    FROM "public"."profiles"
    WHERE "user_id" = NEW."professional_id";

    -- Build full name
    professional_name := COALESCE(professional_first_name || ' ', '') || COALESCE(professional_last_name, '');

    -- Create notification for the structure
    INSERT INTO "public"."notifications" (
      "type",
      "recipient_id",
      "recipient_role",
      "data"
    )
    VALUES (
      'mission_declined',
      NEW."structure_id",
      'structure',
      jsonb_build_object(
        'mission_id', NEW."id",
        'mission_title', NEW."title",
        'professional_id', NEW."professional_id",
        'professional_name', professional_name
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."create_mission_declined_notification"() IS 'Creates a notification when a mission is declined by a professional';

-- Trigger for mission declined
CREATE TRIGGER "trigger_create_mission_declined_notification"
  AFTER UPDATE OF "status" ON "public"."missions"
  FOR EACH ROW
  WHEN (NEW."status" = 'declined' AND (OLD."status" IS NULL OR OLD."status" != 'declined'))
  EXECUTE FUNCTION "public"."create_mission_declined_notification"();

-- ============================================================================
-- Function: create_mission_cancelled_notification
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."create_mission_cancelled_notification"()
RETURNS TRIGGER AS $$
DECLARE
  structure_name TEXT;
BEGIN
  -- Only create notification when status changes to cancelled
  IF NEW."status" = 'cancelled' AND (OLD."status" IS NULL OR OLD."status" != 'cancelled') THEN
    -- Get structure name
    SELECT "name" INTO structure_name
    FROM "public"."structures"
    WHERE "user_id" = NEW."structure_id";

    -- Create notification for the professional
    INSERT INTO "public"."notifications" (
      "type",
      "recipient_id",
      "recipient_role",
      "data"
    )
    VALUES (
      'mission_cancelled',
      NEW."professional_id",
      'professional',
      jsonb_build_object(
        'mission_id', NEW."id",
        'mission_title', NEW."title",
        'structure_id', NEW."structure_id",
        'structure_name', structure_name
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."create_mission_cancelled_notification"() IS 'Creates a notification when a mission is cancelled by a structure';

-- Trigger for mission cancelled
CREATE TRIGGER "trigger_create_mission_cancelled_notification"
  AFTER UPDATE OF "status" ON "public"."missions"
  FOR EACH ROW
  WHEN (NEW."status" = 'cancelled' AND (OLD."status" IS NULL OR OLD."status" != 'cancelled'))
  EXECUTE FUNCTION "public"."create_mission_cancelled_notification"();

-- ============================================================================
-- Function: create_report_sent_notification
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."create_report_sent_notification"()
RETURNS TRIGGER AS $$
DECLARE
  professional_first_name TEXT;
  professional_last_name TEXT;
  professional_name TEXT;
  mission_structure_id UUID;
BEGIN
  -- Only create notification when status changes from draft to sent
  IF OLD."status" = 'draft' AND NEW."status" = 'sent' THEN
    -- Get professional name from profile
    SELECT "first_name", "last_name" INTO professional_first_name, professional_last_name
    FROM "public"."profiles"
    WHERE "user_id" = NEW."author_id";

    -- Build full name
    professional_name := COALESCE(professional_first_name || ' ', '') || COALESCE(professional_last_name, '');

    -- Get structure_id from mission
    SELECT "structure_id" INTO mission_structure_id
    FROM "public"."missions"
    WHERE "id" = NEW."mission_id";

    -- Create notification for the structure
    INSERT INTO "public"."notifications" (
      "type",
      "recipient_id",
      "recipient_role",
      "data"
    )
    VALUES (
      'report_sent',
      mission_structure_id,
      'structure',
      jsonb_build_object(
        'report_id', NEW."id",
        'report_title', NEW."title",
        'mission_id', NEW."mission_id",
        'professional_id', NEW."author_id",
        'professional_name', professional_name
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION "public"."create_report_sent_notification"() IS 'Creates a notification when a report is sent by a professional';

-- Trigger for report sent
CREATE TRIGGER "trigger_create_report_sent_notification"
  AFTER UPDATE OF "status" ON "public"."reports"
  FOR EACH ROW
  WHEN (OLD."status" = 'draft' AND NEW."status" = 'sent')
  EXECUTE FUNCTION "public"."create_report_sent_notification"();
