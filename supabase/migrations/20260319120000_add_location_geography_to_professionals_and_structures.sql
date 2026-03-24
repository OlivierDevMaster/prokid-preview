-- migration: add location geography to professionals and structures
-- purpose: store precise gps coordinates for professionals and structures
-- affected tables and columns:
--   - public.professionals.location
--   - public.professionals.latitude
--   - public.professionals.longitude
--   - public.structures.location
--   - public.structures.latitude
--   - public.structures.longitude
-- special considerations:
--   - requires postgis extension to support geography(point, 4326)
--   - adds gist indexes to optimize geospatial proximity queries

create extension if not exists postgis with schema extensions;

alter table public.professionals
add column if not exists location extensions.geography(point, 4326);


create index if not exists idx_professionals_location
on public.professionals
using gist (location);

alter table public.professionals
add column if not exists latitude numeric;

alter table public.professionals
add column if not exists longitude numeric;



alter table public.structures
add column if not exists location extensions.geography(point, 4326);



alter table public.structures
add column if not exists latitude numeric;

alter table public.structures
add column if not exists longitude numeric;


create index if not exists idx_structures_location
on public.structures
using gist (location);

comment on column public.structures.location is 'gps location in wgs84 (longitude/latitude)';
comment on column public.structures.latitude is 'latitude in wgs84';
comment on column public.structures.longitude is 'longitude in wgs84';
