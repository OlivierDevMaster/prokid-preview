-- Migration: add_mission_received_notification_on_update
-- Purpose: Add trigger to send notification to professional when mission status changes from draft to pending
-- Affected objects: trigger_create_mission_received_notification_on_update
-- Dependencies: Requires create_mission_received_notification function and draft status in mission_status enum

-- Trigger for mission received (on UPDATE from draft to pending)
CREATE TRIGGER "trigger_create_mission_received_notification_on_update"
  AFTER UPDATE OF "status" ON "public"."missions"
  FOR EACH ROW
  WHEN (OLD."status" = 'draft' AND NEW."status" = 'pending')
  EXECUTE FUNCTION "public"."create_mission_received_notification"();

