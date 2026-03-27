-- Migration: create_structure_account_members
-- Purpose: Table for multi-account structure management (owner, admin, member)
-- This is DIFFERENT from structure_members which links structures to professionals for missions

CREATE TABLE IF NOT EXISTS public.structure_account_members (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  structure_id UUID NOT NULL REFERENCES public.structures(user_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (structure_id, user_id)
);

COMMENT ON TABLE public.structure_account_members IS 'Users who can manage a structure account. Owner = creator, admin = can manage, member = read access.';

CREATE INDEX IF NOT EXISTS idx_structure_account_members_structure
  ON public.structure_account_members (structure_id);

CREATE INDEX IF NOT EXISTS idx_structure_account_members_user
  ON public.structure_account_members (user_id);

-- Updated_at trigger
CREATE TRIGGER set_structure_account_members_updated_at
  BEFORE UPDATE ON public.structure_account_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.structure_account_members ENABLE ROW LEVEL SECURITY;

-- Users can manage rows where they are the user or the structure owner
CREATE POLICY "Structure account members access"
  ON public.structure_account_members FOR ALL TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT auth.uid()) = structure_id
    OR (SELECT public.is_admin())
  )
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    OR (SELECT auth.uid()) = structure_id
    OR (SELECT public.is_admin())
  );
