import { createClient } from '@/lib/supabase/client';

import type {
  Professional,
  ProfessionalFilters,
  ProfessionalInsert,
  ProfessionalsWithProfilesSearch,
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
  try {
    const supabase = createClient();

    let query = supabase
      .from('professionals_with_profiles_search')
      .select('*', { count: 'exact' });

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      query = query.or(
        `description.ilike.${searchPattern},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`
      );
    }

    if (filters.locationSearch) {
      const locationSearchPattern = `%${filters.locationSearch}%`;
      query = query.or(
        `city.ilike.${locationSearchPattern},postal_code.ilike.${locationSearchPattern}`
      );
    }

    if (filters.skills?.length) {
      query = query.overlaps('skills', filters.skills);
    }

    const page = paginationOptions.page ?? ProfessionalConfig.PAGE_DEFAULT;

    const limit =
      paginationOptions.limit ?? ProfessionalConfig.PAGE_SIZE_DEFAULT;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { count, data, error } = await query;

    if (error) throw error;

    // Transform flat view data to nested Professional structure
    const transformedData: Professional[] =
      (data as null | ProfessionalsWithProfilesSearch[])?.map(row => {
        const {
          avatar_url,
          first_name,
          is_onboarded,
          last_name,
          profile_created_at,
          profile_email,
          profile_role,
          ...professionalData
        } = row;
        return {
          ...professionalData,
          profile: {
            avatar_url,
            created_at: profile_created_at,
            email: profile_email,
            first_name,
            is_onboarded,
            last_name,
            role: profile_role,
            user_id: row.user_id,
          },
        } as Professional;
      }) ?? [];
    return {
      count: count ?? 0,
      data: transformedData,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteProfessional = async (userId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};
