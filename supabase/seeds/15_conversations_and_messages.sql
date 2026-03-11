-- Seed: conversations and messages
-- Purpose: Create sample chat conversations and messages between structures and professionals for testing
-- Dependencies: Requires conversations and messages tables (chat migrations), structures, professionals, missions, profiles
-- Run after: 09_missions.sql so mission-linked conversations can reference existing missions
--
-- Conversation row display logic:
-- - Pending mission: show mission title + pending status
-- - Accepted mission: show last message preview + accepted status
-- - Declined mission: show mission title + declined status

-- ============================================================================
-- Conversations
-- ============================================================================
-- Conv 1: Structure 1 (Happy Kids) <-> John Doe (general, no mission)
-- Conv 2: Structure 1 (Happy Kids) <-> Marie Martin (mission accepted, chat continued)
-- Conv 3: Structure 2 (Sunshine) <-> John Doe (general)
-- Conv 4: Structure 3 (Little Stars) <-> Marie Martin (mission declined)
-- Conv 5: Structure 1 (Happy Kids) <-> Marie Martin (mission pending, pro just received)

INSERT INTO public.conversations (id, structure_id, professional_id, mission_id)
VALUES
  (
    'a1000000-0000-4000-8000-000000000001',
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
    NULL
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Conversation 2: structure 1 + Marie Martin, linked to their most recent mission (will be set to accepted)
INSERT INTO public.conversations (id, structure_id, professional_id, mission_id)
SELECT
  'a1000000-0000-4000-8000-000000000002',
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
  m.id
FROM public.missions m
WHERE m.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
  AND m.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
ORDER BY m.created_at DESC
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Conversation 5: structure 1 + Marie Martin, linked to another mission (stays pending)
INSERT INTO public.conversations (id, structure_id, professional_id, mission_id)
SELECT
  'a1000000-0000-4000-8000-000000000005',
  '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
  m.id
FROM public.missions m
WHERE m.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869af9'
  AND m.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
ORDER BY m.created_at DESC
OFFSET 1
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Conversation 4: structure 3 + Marie Martin, linked to a declined mission
INSERT INTO public.conversations (id, structure_id, professional_id, mission_id)
SELECT
  'a1000000-0000-4000-8000-000000000004',
  '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
  m.id
FROM public.missions m
WHERE m.structure_id = '08fb0a72-ee9b-4771-bf24-7fe19c869afb'
  AND m.professional_id = '08fb0a72-ee9b-4771-bf24-7fe19c869ae3'
ORDER BY m.created_at DESC
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Set conv2 mission to accepted (pro accepted and continued chat → UI shows last message + accepted)
UPDATE public.missions
SET status = 'accepted'
WHERE id = (
  SELECT mission_id FROM public.conversations
  WHERE id = 'a1000000-0000-4000-8000-000000000002'
);

-- Set conv4 mission to declined (pro declined → UI shows title + declined)
UPDATE public.missions
SET status = 'declined'
WHERE id = (
  SELECT mission_id FROM public.conversations
  WHERE id = 'a1000000-0000-4000-8000-000000000004'
);

-- ============================================================================
-- Messages (conv 1: Happy Kids <-> John Doe)
-- ============================================================================
INSERT INTO public.messages (id, conversation_id, sender_id, content, created_at)
VALUES
  (
    'b1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    'Bonjour John, nous souhaiterions discuter d''une mission pour la prochaine période.',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
    'Bonjour ! Je suis disponible. Pouvez-vous m''en dire plus sur les horaires et le type de mission ?',
    NOW() - INTERVAL '1 hour 50 minutes'
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000001',
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    'Nous avons besoin de quelqu''un pour les après-midis du lundi. La mission serait sur 3 mois à partir d''octobre.',
    NOW() - INTERVAL '1 hour 40 minutes'
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    'a1000000-0000-4000-8000-000000000001',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
    'Cela me convient. Je vous envoie une proposition de rendez-vous pour en discuter.',
    NOW() - INTERVAL '1 hour 30 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Messages (conv 2: Happy Kids <-> Marie Martin, mission-linked)
-- ============================================================================
INSERT INTO public.messages (id, conversation_id, sender_id, content, created_at)
VALUES
  (
    'b1000000-0000-4000-8000-000000000005',
    'a1000000-0000-4000-8000-000000000002',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
    'Bonjour ! J''ai bien reçu les documents pour la mission. Le projet semble passionnant.',
    NOW() - INTERVAL '3 hours'
  ),
  (
    'b1000000-0000-4000-8000-000000000006',
    'a1000000-0000-4000-8000-000000000002',
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    'Bonjour Marie ! Ravi que cela vous intéresse. Souhaitez-vous qu''on fixe un appel pour les détails ?',
    NOW() - INTERVAL '2 hours 50 minutes'
  ),
  (
    'b1000000-0000-4000-8000-000000000007',
    'a1000000-0000-4000-8000-000000000002',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
    'Oui, je suis disponible jeudi matin. Je vous envoie une proposition de créneau.',
    NOW() - INTERVAL '2 hours 40 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Messages (conv 3: Sunshine <-> John Doe)
-- ============================================================================
INSERT INTO public.messages (id, conversation_id, sender_id, content, created_at)
VALUES
  (
    'b1000000-0000-4000-8000-000000000008',
    'a1000000-0000-4000-8000-000000000003',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afa',
    'Bonjour John, nous avons une mission du lundi matin à pourvoir. Êtes-vous toujours disponible ?',
    NOW() - INTERVAL '1 day'
  ),
  (
    'b1000000-0000-4000-8000-000000000009',
    'a1000000-0000-4000-8000-000000000003',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
    'Bonjour, oui je suis disponible le lundi matin. Merci de m''avoir contacté.',
    NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Messages (conv 4: Little Stars <-> Marie Martin, mission declined)
-- ============================================================================
INSERT INTO public.messages (id, conversation_id, sender_id, content, created_at)
VALUES
  (
    'b1000000-0000-4000-8000-000000000010',
    'a1000000-0000-4000-8000-000000000004',
    '08fb0a72-ee9b-4771-bf24-7fe19c869afb',
    'Bonjour Marie, nous vous proposons une mission le mardi après-midi.',
    NOW() - INTERVAL '5 hours'
  ),
  (
    'b1000000-0000-4000-8000-000000000011',
    'a1000000-0000-4000-8000-000000000004',
    '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
    'Merci pour la proposition. Malheureusement je ne suis pas disponible pour ce créneau. Je décline la mission.',
    NOW() - INTERVAL '4 hours 45 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Messages (conv 5: Happy Kids <-> Marie Martin, mission pending)
-- ============================================================================
INSERT INTO public.messages (id, conversation_id, sender_id, content, created_at)
VALUES
  (
    'b1000000-0000-4000-8000-000000000012',
    'a1000000-0000-4000-8000-000000000005',
    '08fb0a72-ee9b-4771-bf24-7fe19c869af9',
    'Bonjour Marie, une nouvelle mission vous a été assignée. Merci de consulter les détails et de nous indiquer si vous acceptez.',
    NOW() - INTERVAL '30 minutes'
  )
ON CONFLICT (id) DO NOTHING;
