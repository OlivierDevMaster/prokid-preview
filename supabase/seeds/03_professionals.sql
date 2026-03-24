-- Seed: professionals
-- Purpose: Create professional profiles for users with role='professional'
-- Note: Profiles are automatically created by the handle_new_user trigger from auth.users

-- Update profiles to set is_onboarded = true for all professionals
UPDATE public.profiles
SET is_onboarded = TRUE
WHERE role = 'professional'::public.role
  AND user_id >= '08fb0a72-ee9b-4771-bf24-7fe19c869ae2'::uuid
  AND user_id <= '08fb0a72-ee9b-4771-bf24-7fe19c869aeb'::uuid;

-- Insert professional profiles
INSERT INTO public.professionals (
  user_id,
  city,
  postal_code,
  intervention_radius_km,
  phone,
  description,
  current_job,
  experience_years,
  hourly_rate,
  verified_at,
  is_available,
  rating,
  reviews_count,
  skills,
  is_certified,
  stripe_customer_id
) VALUES
-- Original 3 professionals
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae2',
  'Paris',
  '75001',
  25.0,
  '+33123456789',
  'Experienced child care professional with 10 years of experience. Specialized in early childhood development and educational activities.',
  'early_childhood_educator',
  10,
  25.50,
  NOW(),
  TRUE,
  4.8,
  15,
  ARRAY['Early Childhood Education', 'First Aid', 'Child Psychology', 'Creative Activities'],
  TRUE,
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae3',
  'Lyon',
  '69001',
  30.0,
  '+33987654321',
  'Passionate about child care with expertise in special needs children. Certified in child development and behavioral management.',
  'health_and_inclusive_care_coordinator',
  8,
  28.00,
  NOW(),
  TRUE,
  4.9,
  22,
  ARRAY['Special Needs Care', 'Behavioral Management', 'Child Development', 'Therapeutic Activities'],
  TRUE,
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae4',
  'Marseille',
  '13001',
  20.0,
  '+33555666777',
  'Dedicated professional with strong background in sports and outdoor activities for children. Great with organizing group activities.',
  'psychomotor_therapist',
  5,
  22.00,
  NULL,
  TRUE,
  4.5,
  8,
  ARRAY['Sports Activities', 'Outdoor Education', 'Group Management', 'Physical Education'],
  FALSE,
  NULL
),
-- Additional professionals
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae5',
  'Toulouse',
  '31000',
  35.0,
  '+33444555666',
  'Experienced educator specializing in language development and multilingual children. Fluent in French, English, and Spanish.',
  'early_childhood_educator',
  7,
  26.00,
  NOW(),
  TRUE,
  4.7,
  18,
  ARRAY['Language Development', 'Multilingual Education', 'Reading Skills', 'Communication'],
  TRUE,
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae6',
  'Nice',
  '06000',
  15.0,
  '+33666777888',
  'Creative professional with expertise in arts and crafts activities. Great at engaging children in creative projects.',
  'other_early_childhood_profession',
  4,
  20.00,
  NULL,
  TRUE,
  4.3,
  12,
  ARRAY['Arts and Crafts', 'Creative Activities', 'Fine Motor Skills', 'Art Education'],
  FALSE,
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae7',
  'Nantes',
  '44000',
  25.0,
  '+33777888999',
  'Certified child care professional with focus on nutrition and healthy eating habits. Organizes cooking activities for children.',
  'other_early_childhood_profession',
  6,
  24.50,
  NOW(),
  TRUE,
  4.6,
  16,
  ARRAY['Nutrition Education', 'Cooking Activities', 'Healthy Habits', 'Meal Planning'],
  TRUE,
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae8',
  'Strasbourg',
  '67000',
  20.0,
  '+33888999000',
  'Professional with expertise in music and movement activities. Uses music therapy techniques to support child development.',
  'psychomotor_therapist',
  5,
  23.00,
  NOW(),
  TRUE,
  4.4,
  10,
  ARRAY['Music Education', 'Movement Activities', 'Music Therapy', 'Rhythm and Coordination'],
  TRUE,
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869ae9',
  'Bordeaux',
  '33000',
  30.0,
  '+33999000111',
  'Experienced in working with infants and toddlers. Specialized in early motor development and sensory activities.',
  'early_childhood_educator',
  9,
  27.00,
  NOW(),
  TRUE,
  4.8,
  20,
  ARRAY['Infant Care', 'Toddler Development', 'Sensory Activities', 'Motor Skills'],
  TRUE,
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aea',
  'Lille',
  '59000',
  25.0,
  '+33111222333',
  'Professional with strong background in science and nature activities. Organizes educational experiments and nature exploration.',
  'early_childhood_educator',
  6,
  24.00,
  NOW(),
  TRUE,
  4.5,
  14,
  ARRAY['Science Education', 'Nature Activities', 'Experiments', 'Environmental Awareness'],
  TRUE,
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aeb',
  'Rennes',
  '35000',
  20.0,
  '+33222333444',
  'Certified professional specializing in emotional intelligence and social skills development. Great at conflict resolution.',
  'health_and_inclusive_care_coordinator',
  7,
  25.00,
  NOW(),
  TRUE,
  4.7,
  19,
  ARRAY['Emotional Intelligence', 'Social Skills', 'Conflict Resolution', 'Empathy Development'],
  TRUE,
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aec',
  'Montpellier',
  '34000',
  22.0,
  '+33333444555',
  'Professional with expertise in technology and digital literacy for children. Balances screen time with physical activities.',
  'other_early_childhood_profession',
  5,
  23.50,
  NULL,
  TRUE,
  4.2,
  9,
  ARRAY['Digital Literacy', 'Technology Education', 'Educational Apps', 'Screen Time Management'],
  FALSE,
  NULL
),
(
  '08fb0a72-ee9b-4771-bf24-7fe19c869aed',
  'Reims',
  '51100',
  18.0,
  '+33444555666',
  'Experienced in working with school-age children. Specialized in homework support and educational reinforcement.',
  'early_childhood_educator',
  8,
  26.50,
  NOW(),
  TRUE,
  4.8,
  21,
  ARRAY['Homework Support', 'Academic Reinforcement', 'Study Skills', 'School-Age Care'],
  TRUE,
  NULL
) ON CONFLICT (user_id) DO NOTHING;

-- Seed geolocation columns for proximity search (idempotent)
-- Note: functions are qualified with `extensions` to avoid search_path issues.
WITH professional_geo AS (
  SELECT *
  FROM (
    VALUES
      ('08fb0a72-ee9b-4771-bf24-7fe19c869ae2'::uuid, 'Paris'::text, '75001'::text, 45::numeric, 48.8566::numeric, 2.3522::numeric),
      ('08fb0a72-ee9b-4771-bf24-7fe19c869ae3'::uuid, 'Lyon'::text, '69001'::text, 45::numeric, 45.7640::numeric, 4.8357::numeric),
      ('08fb0a72-ee9b-4771-bf24-7fe19c869ae4'::uuid, 'Marseille'::text, '13001'::text, 45::numeric, 43.2965::numeric, 5.3698::numeric),
      ('08fb0a72-ee9b-4771-bf24-7fe19c869ae5'::uuid, 'Toulouse'::text, '31000'::text, 45::numeric, 43.6047::numeric, 1.4442::numeric),
      -- Extra pros close to Bordeaux (structure: Butterfly Daycare)
      ('08fb0a72-ee9b-4771-bf24-7fe19c869ae6'::uuid, 'Bordeaux'::text, '33000'::text, 45::numeric, 44.8370::numeric, -0.5800::numeric),
      -- Extra pros close to Toulouse (structure: Rainbow Children Center)
      ('08fb0a72-ee9b-4771-bf24-7fe19c869ae7'::uuid, 'Toulouse'::text, '31000'::text, 45::numeric, 43.6040::numeric, 1.4550::numeric),
      -- Extra pros close to Marseille (structure: Little Stars Nursery)
      ('08fb0a72-ee9b-4771-bf24-7fe19c869ae8'::uuid, 'Marseille'::text, '13001'::text, 45::numeric, 43.2960::numeric, 5.3810::numeric),
      -- Pro close to Bordeaux (structure: Butterfly Daycare)
      ('08fb0a72-ee9b-4771-bf24-7fe19c869ae9'::uuid, 'Bordeaux'::text, '33000'::text, 45::numeric, 44.8378::numeric, -0.5792::numeric),
      -- Extra pros close to Paris (structure: Happy Kids Daycare Center)
      ('08fb0a72-ee9b-4771-bf24-7fe19c869aea'::uuid, 'Paris'::text, '75001'::text, 45::numeric, 48.8570::numeric, 2.3490::numeric),
      -- Extra pros close to Lyon (structure: Sunshine Childcare Services)
      ('08fb0a72-ee9b-4771-bf24-7fe19c869aeb'::uuid, 'Lyon'::text, '69001'::text, 45::numeric, 45.7630::numeric, 4.8400::numeric),
      ('08fb0a72-ee9b-4771-bf24-7fe19c869aec'::uuid, 'Montpellier'::text, '34000'::text, 45::numeric, 43.6119::numeric, 3.8772::numeric),
      ('08fb0a72-ee9b-4771-bf24-7fe19c869aed'::uuid, 'Reims'::text, '51100'::text, 45::numeric, 49.2583::numeric, 4.0317::numeric)
  ) AS t(user_id, city, postal_code, intervention_radius_km, latitude, longitude)
)
UPDATE public.professionals p
SET
  city = pg.city,
  postal_code = pg.postal_code,
  intervention_radius_km = pg.intervention_radius_km,
  latitude = pg.latitude,
  longitude = pg.longitude,
  location = extensions.ST_SetSRID(
    extensions.ST_MakePoint(pg.longitude::double precision, pg.latitude::double precision),
    4326
  )::extensions.geography
FROM professional_geo pg
WHERE p.user_id = pg.user_id;
