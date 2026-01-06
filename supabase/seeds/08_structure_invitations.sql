-- Seed: structure_invitations
-- Purpose: Create structure invitations that will be accepted/declined to create memberships via triggers
-- Note: When invitations are accepted, the handle_invitation_accepted trigger automatically creates structure_members
-- Note: Only professionals with availabilities (ae2-ae6) receive invitations

-- ============================================================================
-- Step 1: Create pending invitations (only for professionals with availabilities)
-- ============================================================================

-- Structure 1 (Happy Kids Daycare) - invites professionals ae2, ae3
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 2 (Sunshine Childcare Services) - invites professionals ae2, ae4
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 3 (Little Stars Nursery) - invites professionals ae3, ae5
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 4 (Rainbow Children Center) - invites professionals ae4, ae5
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 5 (Butterfly Daycare) - invites professionals ae5, ae6
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- ============================================================================
-- Step 2: Update invitations to accepted status (triggers will create memberships)
-- ============================================================================

-- Professional 010 (ae2) - accepts from structures 1, 2
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa'
  )
  AND status = 'pending';

-- Professional 011 (ae3) - accepts from structures 1, 3
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
  )
  AND status = 'pending';

-- Professional 012 (ae4) - accepts from structures 2, 4
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  )
  AND status = 'pending';

-- Professional 013 (ae5) - accepts from structures 3, 4, 5
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  )
  AND status = 'pending';

-- Professional 014 (ae6) - accepts from structure 5
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  )
  AND status = 'pending';
