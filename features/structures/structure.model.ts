import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

import { Order } from '@/lib/utils/enums';

export type Structure = {
  profile: Tables<'profiles'>;
} & Tables<'structures'>;

export type StructureColumn = keyof Tables<'structures'>;

export const StructureColumn = {
  created_at: 'created_at',
  latitude: 'latitude',
  location: 'location',
  longitude: 'longitude',
  name: 'name',
  stripe_customer_id: 'stripe_customer_id',
  updated_at: 'updated_at',
  user_id: 'user_id',
} as const satisfies {
  [K in StructureColumn]: K;
};

export const StructureColumns = Object.freeze(Object.values(StructureColumn));

// Special sort value for name (not a direct column - uses profile)
export const StructureSortName = 'name' as const;

// Sort option values for dropdown
export const StructureSortOption = {
  name_asc: 'name_asc',
  name_desc: 'name_desc',
  newest: 'newest',
  oldest: 'oldest',
} as const;

export interface StructureFilters {
  locationSearch?: string;
  order?: Order;
  search?: string;
  skills?: string[];
  sort?: StructureColumn | typeof StructureSortName;
}

export type StructureInsert = TablesInsert<'structures'>;

export type StructureSortOption =
  (typeof StructureSortOption)[keyof typeof StructureSortOption];

export type StructureUpdate = TablesUpdate<'structures'>;
