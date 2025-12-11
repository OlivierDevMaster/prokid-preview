-- Migration: enable_notifications_realtime
-- Purpose: Enable realtime broadcasting for notifications table using broadcast triggers
-- Affected tables: notifications, realtime.messages
-- Dependencies: Requires notifications table and realtime extension to exist

-- ============================================================================
-- Function: notifications_broadcast_trigger
-- ============================================================================

-- Broadcast notification changes to user-specific channels
-- Topic format: user:{recipient_id}:notifications
CREATE OR REPLACE FUNCTION "public"."notifications_broadcast_trigger"()
RETURNS TRIGGER AS $$
SECURITY DEFINER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'user:' || COALESCE(NEW."recipient_id", OLD."recipient_id")::text || ':notifications',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION "public"."notifications_broadcast_trigger"() IS 'Broadcasts notification changes to user-specific realtime channels using the pattern user:{recipient_id}:notifications';

-- ============================================================================
-- Trigger: notifications_broadcast_trigger
-- ============================================================================

-- Trigger to broadcast changes on INSERT, UPDATE, or DELETE
CREATE TRIGGER "trigger_notifications_broadcast"
  AFTER INSERT OR UPDATE OR DELETE ON "public"."notifications"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."notifications_broadcast_trigger"();

-- ============================================================================
-- RLS Policies: realtime.messages
-- ============================================================================

-- Enable RLS on realtime.messages if not already enabled
ALTER TABLE IF EXISTS "realtime"."messages" ENABLE ROW LEVEL SECURITY;

-- Users can read broadcasts from their own notification channels
-- Topic format: user:{user_id}:notifications
CREATE POLICY "Users can read their own notification broadcasts" ON "realtime"."messages"
  FOR SELECT
  TO authenticated
  USING (
    topic LIKE 'user:%:notifications' AND
    SPLIT_PART(topic, ':', 2)::uuid = (SELECT auth.uid())
  );

-- Admins can read all notification broadcasts
CREATE POLICY "Admins can read all notification broadcasts" ON "realtime"."messages"
  FOR SELECT
  TO authenticated
  USING (
    topic LIKE 'user:%:notifications' AND
    (SELECT public.is_admin())
  );

-- ============================================================================
-- Indexes: realtime.messages (for RLS policy performance)
-- ============================================================================

-- Index to optimize topic parsing in RLS policies
-- Note: This index may already exist, but creating it ensures optimal performance
CREATE INDEX IF NOT EXISTS "idx_realtime_messages_topic_pattern" ON "realtime"."messages" 
  USING btree (topic text_pattern_ops)
  WHERE topic LIKE 'user:%:notifications';
