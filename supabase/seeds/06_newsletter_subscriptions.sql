-- Seed: newsletter_subscriptions
-- Purpose: Create newsletter subscription entries
-- Note: This table is independent and can be seeded at any time

INSERT INTO public.newsletter_subscriptions (
  email,
  name
) VALUES 
(
  'subscriber1@example.com',
  'Alice Johnson'
),
(
  'subscriber2@example.com',
  'Bob Smith'
),
(
  'parent@example.com',
  'Parent User'
),
(
  'caregiver@example.com',
  'Caregiver Name'
),
(
  'interested@example.com',
  NULL
) ON CONFLICT (email) DO NOTHING;


