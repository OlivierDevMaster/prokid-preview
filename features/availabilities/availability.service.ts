import { createClient } from '@/lib/supabase/client';

import type {
  Availability,
  AvailabilityFilters,
  AvailabilityInsert,
  AvailabilityUpdate,
} from './availability.model';

import {
  PaginationOptions,
  PaginationResult,
} from '../paginations/pagination.model';
import { AvailabilityConfig } from './availability.config';

export const createAvailability = async (
  insertData: AvailabilityInsert
): Promise<Availability> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('availabilities')
    .insert(insertData)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const findAvailability = async (
  id: string
): Promise<Availability | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('availabilities')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const updateAvailability = async (
  id: string,
  updateData: AvailabilityUpdate
): Promise<Availability> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('availabilities')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const deleteAvailability = async (id: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.from('availabilities').delete().eq('id', id);

  if (error) throw error;
};

export const getAvailabilities = async (
  filters: AvailabilityFilters,
  paginationOptions: PaginationOptions
): Promise<PaginationResult<Availability>> => {
  const supabase = createClient();

  let query = supabase.from('availabilities').select('*', { count: 'exact' });

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  const page = paginationOptions.page ?? AvailabilityConfig.PAGE_DEFAULT;

  const limit = paginationOptions.limit ?? AvailabilityConfig.PAGE_SIZE_DEFAULT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: data ?? [],
  };
};
