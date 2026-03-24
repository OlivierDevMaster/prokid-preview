import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

import { Order } from '@/lib/utils/enums';

export type Professional = {
  profile: Tables<'profiles'>;
} & Tables<'professionals'>;

export type ProfessionalColumn = keyof Tables<'professionals'>;

export const ProfessionalColumn = {
  availability_end: 'availability_end',
  availability_start: 'availability_start',
  city: 'city',
  created_at: 'created_at',
  current_job: 'current_job',
  description: 'description',
  experience_years: 'experience_years',
  has_used_trial: 'has_used_trial',
  hourly_rate: 'hourly_rate',
  intervention_radius_km: 'intervention_radius_km',
  is_available: 'is_available',
  is_certified: 'is_certified',
  latitude: 'latitude',
  location: 'location',
  longitude: 'longitude',
  phone: 'phone',
  postal_code: 'postal_code',
  rating: 'rating',
  reviews_count: 'reviews_count',
  skills: 'skills',
  stripe_customer_id: 'stripe_customer_id',
  updated_at: 'updated_at',
  user_id: 'user_id',
  verified_at: 'verified_at',
} as const satisfies {
  [K in ProfessionalColumn]: K;
};

export const ProfessionalColumns = Object.freeze(
  Object.values(ProfessionalColumn)
);

// Special sort value for name (not a direct column)
export const ProfessionalSortName = 'name' as const;

// Sort option values for dropdown
export const ProfessionalSortOption = {
  name_asc: 'name_asc',
  name_desc: 'name_desc',
  newest: 'newest',
  oldest: 'oldest',
} as const;

export interface ProfessionalFilters {
  availability?: string;
  current_job?: string;
  locationSearch?: string;
  order?: Order;
  search?: string;
  sort?: 'name' | ProfessionalColumn;
}

export type ProfessionalInsert = TablesInsert<'professionals'>;

export type ProfessionalSortOption =
  (typeof ProfessionalSortOption)[keyof typeof ProfessionalSortOption];

export type ProfessionalsWithProfilesSearch = {
  avatar_url: null | string;
  first_name: null | string;
  is_onboarded: boolean;
  last_name: null | string;
  profile_created_at: string;
  profile_email: string;
  profile_role: Tables<'profiles'>['role'];
} & Tables<'professionals'>;

export type ProfessionalUpdate = TablesUpdate<'professionals'>;
