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

-- Members can view their own structure's members
CREATE POLICY "Members can view structure account members"
  ON public.structure_account_members FOR SELECT TO authenticated
  USING (
    structure_id IN (
      SELECT sam.structure_id FROM public.structure_account_members sam
      WHERE sam.user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.uid()) = user_id
  );

-- Only owners and admins can add members
CREATE POLICY "Owners and admins can add members"
  ON public.structure_account_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.structure_account_members sam
      WHERE sam.structure_id = structure_id
        AND sam.user_id = (SELECT auth.uid())
        AND sam.role IN ('owner', 'admin')
    )
    -- OR the user is creating their own owner record (first time setup)
    OR (
      (SELECT auth.uid()) = user_id
      AND role = 'owner'
      AND NOT EXISTS (
        SELECT 1 FROM public.structure_account_members sam
        WHERE sam.structure_id = structure_id AND sam.role = 'owner'
      )
    )
  );

-- Only owners can remove members (except owner can't remove themselves)
CREATE POLICY "Owners can remove members"
  ON public.structure_account_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.structure_account_members sam
      WHERE sam.structure_id = structure_id
        AND sam.user_id = (SELECT auth.uid())
        AND sam.role = 'owner'
    )
    AND role != 'owner'
  );

-- Admins can manage all
CREATE POLICY "Admins can manage structure account members"
  ON public.structure_account_members FOR ALL TO authenticated
  USING ((SELECT public.is_admin()));
