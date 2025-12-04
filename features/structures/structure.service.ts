import { createClient } from '@/lib/supabase/client';

import type {
  Structure,
  StructureFilters,
  StructureInsert,
  StructureUpdate,
} from './structure.model';

import {
  PaginationOptions,
  PaginationResult,
} from '../paginations/pagination.model';
import { StructureConfig } from './structure.config';

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
    query = query.ilike('description', `%${filters.search}%`);
    query = query.ilike('profile.first_name', `%${filters.search}%`);
    query = query.ilike('profile.last_name', `%${filters.search}%`);
  }

  if (filters.locationSearch) {
    query = query.ilike('city', `%${filters.locationSearch}%`);
    query = query.ilike('postal_code', `%${filters.locationSearch}%`);
  }

  if (filters.skills?.length) {
    query = query.overlaps('skills', filters.skills);
  }

  const page = paginationOptions.page ?? StructureConfig.PAGE_DEFAULT;

  const limit = paginationOptions.limit ?? StructureConfig.PAGE_SIZE_DEFAULT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query
    .order('profile.first_name', { ascending: false })
    .range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: data ?? [],
  };
};
