-- Add address and contact fields to structures table
ALTER TABLE public.structures
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS structure_type TEXT;

-- Update seed structures with addresses
UPDATE public.structures SET
  address = '12 Rue de la Paix',
  city = 'Paris',
  postal_code = '75002',
  phone = '01 42 00 00 01'
WHERE name = 'Happy Kids Daycare Center';

UPDATE public.structures SET
  address = '45 Rue de la République',
  city = 'Lyon',
  postal_code = '69001',
  phone = '04 72 00 00 02'
WHERE name = 'Sunshine Childcare Services';

UPDATE public.structures SET
  address = '8 Boulevard du Prado',
  city = 'Marseille',
  postal_code = '13008',
  phone = '04 91 00 00 03'
WHERE name = 'Little Stars Nursery';

UPDATE public.structures SET
  address = '22 Rue Alsace-Lorraine',
  city = 'Toulouse',
  postal_code = '31000',
  phone = '05 61 00 00 04'
WHERE name = 'Rainbow Children Center';

UPDATE public.structures SET
  address = '3 Cours de l''Intendance',
  city = 'Bordeaux',
  postal_code = '33000',
  phone = '05 56 00 00 05'
WHERE name = 'Butterfly Daycare';
