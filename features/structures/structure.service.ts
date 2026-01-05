import { createClient } from '@/lib/supabase/client';
import { Order } from '@/lib/utils/enums';

import {
  PaginationOptions,
  PaginationResult,
} from '../paginations/pagination.model';
import { StructureConfig } from './structure.config';
import {
  type Structure,
  StructureColumn,
  type StructureFilters,
  type StructureInsert,
  type StructureUpdate,
} from './structure.model';

export const createStructure = async (
  insertData: StructureInsert
): Promise<Structure> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('structures')
    .insert(insertData)
    .select(
      `
        *,
        profile:profiles(*)
      `
    )
    .single();

  if (error) throw error;

  return data;
};

export const findStructure = async (
  userId: string
): Promise<null | Structure> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('structures')
    .select(
      `
        *,
        profile:profiles(*)
      `
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const updateStructure = async (
  userId: string,
  updateData: StructureUpdate
): Promise<Structure> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('structures')
    .update(updateData)
    .eq('user_id', userId)
    .select(
      `
      *,
      profile:profiles(*)
    `
    )
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  return data;
};

export const getStructures = async (
  filters: StructureFilters,
  paginationOptions: PaginationOptions
): Promise<PaginationResult<Structure>> => {
  const supabase = createClient();

  let query = supabase.from('structures').select(
    `
        *,
        profile:profiles(*)
      `,
    { count: 'exact' }
  );

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
    query = query.ilike('profile.email', `%${filters.search}%`);
  }

  if (filters.locationSearch) {
    // Note: Structures don't have city/postal_code directly
    // This filter is kept for API compatibility but won't filter structures
    // If needed, this could be removed or structures could be extended with location fields
  }

  if (filters.skills?.length) {
    query = query.overlaps('skills', filters.skills);
  }

  const page = paginationOptions.page ?? StructureConfig.PAGE_DEFAULT;

  const limit = paginationOptions.limit ?? StructureConfig.PAGE_SIZE_DEFAULT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Apply sorting
  const sortColumn = filters.sort || StructureColumn.created_at;
  const sortOrder = filters.order || Order.desc;
  const ascending = sortOrder === Order.asc;

  if (sortColumn === 'name') {
    // Special handling for name sorting (uses name field directly)
    query = query.order('name', { ascending });
  } else {
    // For other columns, use the column directly
    query = query.order(sortColumn, { ascending });
    // Add secondary sort by user_id for consistency
    query = query.order(StructureColumn.user_id, { ascending });
  }

  query = query.range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: data ?? [],
  };
};

export const deleteStructure = async (userId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('structures')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};
