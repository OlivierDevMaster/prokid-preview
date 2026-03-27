-- Add report_id to messages for inline report sharing in conversations
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES public.reports(id);
CREATE INDEX IF NOT EXISTS idx_messages_report_id ON public.messages (report_id) WHERE report_id IS NOT NULL;

-- Add 'report' to allowed message types
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_type_check
  CHECK (type = ANY (ARRAY['text', 'appointment_link', 'system', 'report']));
