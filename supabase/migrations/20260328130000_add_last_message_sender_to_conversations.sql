-- Add last_message_sender_id to conversations for tracking who sent the last message
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message_sender_id UUID;

-- Update trigger to also set last_message_sender_id
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      last_message_preview = LEFT(NEW.content, 100),
      last_message_sender_id = NEW.sender_id,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing conversations
UPDATE conversations c SET last_message_sender_id = (
  SELECT sender_id FROM messages m
  WHERE m.conversation_id = c.id
  ORDER BY m.created_at DESC LIMIT 1
) WHERE last_message_sender_id IS NULL;
