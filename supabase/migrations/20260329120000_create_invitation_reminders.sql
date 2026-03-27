-- Invitation reminder system for follow-up emails (J+3, J+7, J+14, J+30)
CREATE TABLE IF NOT EXISTS public.invitation_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('j3', 'j7', 'j14', 'j30')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitation_reminders_scheduled ON public.invitation_reminders (scheduled_at) WHERE sent_at IS NULL;
CREATE UNIQUE INDEX idx_invitation_reminders_unique ON public.invitation_reminders (profile_id, reminder_type);

ALTER TABLE public.invitation_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage invitation reminders" ON public.invitation_reminders FOR ALL TO authenticated USING ((SELECT public.is_admin()));
