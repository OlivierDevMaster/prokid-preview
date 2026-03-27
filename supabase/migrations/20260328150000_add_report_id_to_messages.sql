-- Add report_id to messages for inline report sharing in conversations
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES public.reports(id);
CREATE INDEX IF NOT EXISTS idx_messages_report_id ON public.messages (report_id) WHERE report_id IS NOT NULL;
