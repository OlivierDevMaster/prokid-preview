import { createClient } from '@/lib/supabase/client';

import type {
  Professional,
  ProfessionalFilters,
  ProfessionalInsert,
  ProfessionalUpdate,
} from './professional.model';

import {
  PaginationOptions,
  PaginationResult,
} from '../paginations/pagination.model';
import { ProfessionalConfig } from './professional.config';

export const createProfessional = async (
  insertData: ProfessionalInsert
): Promise<Professional> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professionals')
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

export const findProfessional = async (
  userId: string
): Promise<null | Professional> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professionals')
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

export const updateProfessional = async (
  userId: string,
  updateData: ProfessionalUpdate
): Promise<Professional> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professionals')
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

export const getProfessionals = async (
  filters: ProfessionalFilters,
  paginationOptions: PaginationOptions
): Promise<PaginationResult<Professional>> => {
  const supabase = createClient();

  let query = supabase.from('professionals').select(
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

  const page = paginationOptions.page ?? ProfessionalConfig.PAGE_DEFAULT;

  const limit = paginationOptions.limit ?? ProfessionalConfig.PAGE_SIZE_DEFAULT;

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
