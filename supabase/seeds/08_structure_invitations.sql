-- Seed: structure_invitations
-- Purpose: Create structure invitations that will be accepted/declined to create memberships via triggers
-- Note: When invitations are accepted, the handle_invitation_accepted trigger automatically creates structure_members
-- Note: Each structure invites all professionals, and each professional receives invitations from multiple structures

-- ============================================================================
-- Step 1: Create pending invitations from all structures to all professionals
-- ============================================================================

-- Structure 1 (Happy Kids Daycare) - invites all professionals
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869af9', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 2 (Sunshine Childcare Services) - invites all professionals
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afa', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 3 (Little Stars Nursery) - invites all professionals
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afb', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 4 (Rainbow Children Center) - invites all professionals
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afc', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 5 (Butterfly Daycare) - invites all professionals
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afd', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 6 (Wonderland Childcare) - invites all professionals
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 7 (Little Explorers Academy) - invites all professionals
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869aff', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 8 (Bright Future Daycare) - invites all professionals
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b00', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 9 (Tiny Tots Nursery) - invites all professionals
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b01', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- Structure 10 (Growing Minds Center) - invites all professionals
INSERT INTO public.structure_invitations (structure_id, professional_id, status)
VALUES
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae2', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae3', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae4', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae5', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae6', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae7', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae8', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869ae9', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aea', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aeb', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aec', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aed', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aee', 'pending'),
  ('08fb0a72-ee9b-4771-bf24-7fe19c869b02', '08fb0a72-ee9b-4771-bf24-7fe19c869aef', 'pending')
ON CONFLICT (structure_id, professional_id) WHERE status = 'pending' DO NOTHING;

-- ============================================================================
-- Step 2: Update invitations to accepted status (triggers will create memberships)
-- Each professional accepts invitations from 3-5 structures to create multiple memberships
-- ============================================================================

-- Professional 010 (ae2) - accepts from structures 1, 2, 3, 4, 5
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  )
  AND status = 'pending';

-- Professional 011 (ae3) - accepts from structures 1, 2, 6, 7
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afe',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aff'
  )
  AND status = 'pending';

-- Professional 012 (ae4) - accepts from structures 2, 3, 4, 8
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b00'
  )
  AND status = 'pending';

-- Professional 013 (ae5) - accepts from structures 3, 4, 5, 6, 9
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afe',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
  )
  AND status = 'pending';

-- Professional 014 (ae6) - accepts from structures 1, 5, 7, 8
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aff',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b00'
  )
  AND status = 'pending';

-- Professional 015 (ae7) - accepts from structures 2, 3, 6, 9, 10
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae7'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afe',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b01',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b02'
  )
  AND status = 'pending';

-- Professional 016 (ae8) - accepts from structures 1, 4, 7, 8, 10
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aff',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b00',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b02'
  )
  AND status = 'pending';

-- Professional 017 (ae9) - accepts from structures 2, 5, 6, 9
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae9'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afe',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
  )
  AND status = 'pending';

-- Professional 018 (aea) - accepts from structures 3, 4, 7, 8, 10
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aea'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aff',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b00',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b02'
  )
  AND status = 'pending';

-- Professional 019 (aeb) - accepts from structures 1, 2, 5, 9
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aeb'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
  )
  AND status = 'pending';

-- Professional 01a (aec) - accepts from structures 3, 6, 7, 8, 10
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aec'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afe',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aff',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b00',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b02'
  )
  AND status = 'pending';

-- Professional 01b (aed) - accepts from structures 1, 4, 5, 9
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aed'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
  )
  AND status = 'pending';

-- Professional 01c (aee) - accepts from structures 2, 3, 6, 10
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aee'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afe',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b02'
  )
  AND status = 'pending';

-- Professional 01d (aef) - accepts from structures 4, 5, 7, 8, 9
UPDATE public.structure_invitations
SET status = 'accepted'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aef'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aff',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b00',
    '08fb0a72-ee9b-4771-bf24-7fe19c869b01'
  )
  AND status = 'pending';

-- ============================================================================
-- Step 3: Update some invitations to declined status (for variety)
-- Each professional declines 2-3 invitations
-- ============================================================================

-- Professional 010 declines from structures 6, 7
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'
  AND structure_id IN ('08fb0a72-ee9b-4771-bf24-7fe19c869afe', '08fb0a72-ee9b-4771-bf24-7fe19c869aff')
  AND status = 'pending';

-- Professional 011 declines from structures 3, 4, 5
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  )
  AND status = 'pending';

-- Professional 012 declines from structures 1, 5, 6
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae4'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afe'
  )
  AND status = 'pending';

-- Professional 013 declines from structures 1, 2, 7
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae5'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869aff'
  )
  AND status = 'pending';

-- Professional 014 declines from structures 2, 3, 4
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae6'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  )
  AND status = 'pending';

-- Professional 015 declines from structures 1, 4, 5
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae7'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  )
  AND status = 'pending';

-- Professional 016 declines from structures 2, 3, 5
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae8'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  )
  AND status = 'pending';

-- Professional 017 declines from structures 1, 3, 4
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae9'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  )
  AND status = 'pending';

-- Professional 018 declines from structures 1, 2, 5
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aea'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  )
  AND status = 'pending';

-- Professional 019 declines from structures 3, 4, 6
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aeb'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afe'
  )
  AND status = 'pending';

-- Professional 01a declines from structures 1, 2, 4
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aec'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc'
  )
  AND status = 'pending';

-- Professional 01b declines from structures 2, 3, 6
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aed'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afe'
  )
  AND status = 'pending';

-- Professional 01c declines from structures 1, 4, 5
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aee'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afc',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afd'
  )
  AND status = 'pending';

-- Professional 01d declines from structures 1, 2, 3
UPDATE public.structure_invitations
SET status = 'declined'
WHERE professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869aef'
  AND structure_id IN (
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
  )
  AND status = 'pending';
