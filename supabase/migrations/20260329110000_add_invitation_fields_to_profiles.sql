-- Add invitation tracking fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.profiles(user_id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invitation_status TEXT DEFAULT 'none' CHECK (invitation_status IN ('none', 'invited', 'completed'));
