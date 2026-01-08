-- Migration: add_email_notification_preferences
-- Purpose: Add email_notifications field to professional_notification_preferences and create structure_notification_preferences table
-- Affected tables: professional_notification_preferences, structure_notification_preferences
-- Dependencies: Requires professional_notification_preferences, structures, and profiles tables to exist

-- ============================================================================
-- Add email_notifications to professional_notification_preferences
-- ============================================================================

ALTER TABLE "public"."professional_notification_preferences"
  ADD COLUMN IF NOT EXISTS "email_notifications" BOOLEAN DEFAULT TRUE NOT NULL;

COMMENT ON COLUMN "public"."professional_notification_preferences"."email_notifications" IS 'Receive email notifications for app notifications (default: true)';

-- ============================================================================
-- Model: structure_notification_preferences
-- ============================================================================

-- Declaration
CREATE TABLE IF NOT EXISTS "public"."structure_notification_preferences" (
  "user_id" UUID NOT NULL PRIMARY KEY REFERENCES "public"."structures"("user_id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "email_notifications" BOOLEAN DEFAULT TRUE NOT NULL
);

-- Comments
COMMENT ON TABLE "public"."structure_notification_preferences" IS 'Notification preferences for structure users';
COMMENT ON COLUMN "public"."structure_notification_preferences"."user_id" IS 'Reference to the structure user';
COMMENT ON COLUMN "public"."structure_notification_preferences"."email_notifications" IS 'Receive email notifications for app notifications (default: true)';

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_structure_notification_preferences_user_id" ON "public"."structure_notification_preferences" ("user_id");

-- Triggers
CREATE TRIGGER update_structure_notification_preferences_updated_at BEFORE UPDATE ON "public"."structure_notification_preferences"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE "public"."structure_notification_preferences" ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification preferences
CREATE POLICY "Users can view their own structure notification preferences" ON "public"."structure_notification_preferences"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id");

-- Users can update their own notification preferences
CREATE POLICY "Users can update their own structure notification preferences" ON "public"."structure_notification_preferences"
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = "user_id")
  WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Users can insert their own notification preferences
CREATE POLICY "Users can insert their own structure notification preferences" ON "public"."structure_notification_preferences"
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

-- Admins can view all structure notification preferences
CREATE POLICY "Admins can view all structure notification preferences" ON "public"."structure_notification_preferences"
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

-- Admins can update all structure notification preferences
CREATE POLICY "Admins can update all structure notification preferences" ON "public"."structure_notification_preferences"
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Admins can insert structure notification preferences
CREATE POLICY "Admins can insert structure notification preferences" ON "public"."structure_notification_preferences"
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

