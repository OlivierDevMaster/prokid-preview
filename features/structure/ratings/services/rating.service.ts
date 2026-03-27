import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { createClient } from '@/lib/supabase/client';

import type {
  ProfessionalRating,
  ProfessionalRatingInsert,
  ProfessionalRatingUpdate,
  ProfessionalRatingWithRelations,
} from '../ratings.model';

import { RatingConfig } from '../ratings.config';

export const createRating = async (
  structureId: string,
  professionalId: string,
  rating: number,
  comment?: null | string,
  missionId?: null | string
): Promise<ProfessionalRating> => {
  const supabase = createClient();

  const insertData: ProfessionalRatingInsert = {
    comment: comment || null,
    mission_id: missionId || null,
    professional_id: professionalId,
    rating,
    structure_id: structureId,
  };

  const { data, error } = await supabase
    .from('professional_ratings')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  return data as ProfessionalRating;
};

export const updateRating = async (
  ratingId: string,
  rating: number,
  comment?: null | string
): Promise<ProfessionalRating> => {
  const supabase = createClient();

  const updateData: ProfessionalRatingUpdate = {
    comment: comment !== undefined ? comment : undefined,
    rating,
  };

  const { data, error } = await supabase
    .from('professional_ratings')
    .update(updateData)
    .eq('id', ratingId)
    .select()
    .single();

  if (error) throw error;

  return data as ProfessionalRating;
};

export const deleteRating = async (ratingId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('professional_ratings')
    .delete()
    .eq('id', ratingId);

  if (error) throw error;
};

export const getRatingForStructureAndProfessional = async (
  structureId: string,
  professionalId: string,
  missionId?: string
): Promise<null | ProfessionalRatingWithRelations> => {
  const supabase = createClient();

  let query = supabase
    .from('professional_ratings')
    .select(
      `
      *,
      structure:structures(
        *,
        profile:profiles(*)
      ),
      professional:professionals(
        *,
        profile:profiles(*)
      )
    `
    )
    .eq('structure_id', structureId)
    .eq('professional_id', professionalId);

  if (missionId) {
    query = query.eq('mission_id', missionId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as ProfessionalRatingWithRelations;
};

export const getRatingsForProfessional = async (
  professionalId: string,
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<ProfessionalRatingWithRelations>> => {
  const supabase = createClient();

  const page = paginationOptions.page ?? RatingConfig.PAGE_DEFAULT;
  const limit = paginationOptions.limit ?? RatingConfig.PAGE_SIZE_DEFAULT;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { count, data, error } = await supabase
    .from('professional_ratings')
    .select(
      `
      *,
      structure:structures(
        *,
        profile:profiles(*)
      ),
      professional:professionals(
        *,
        profile:profiles(*)
      )
    `,
      { count: 'exact' }
    )
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    count: count ?? 0,
    data: (data ?? []) as ProfessionalRatingWithRelations[],
  };
};

export const getRatingsForStructure = async (
  structureId: string,
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<ProfessionalRatingWithRelations>> => {
  const supabase = createClient();

  const page = paginationOptions.page ?? RatingConfig.PAGE_DEFAULT;
  const limit = paginationOptions.limit ?? RatingConfig.PAGE_SIZE_DEFAULT;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { count, data, error } = await supabase
    .from('professional_ratings')
    .select(
      `
      *,
      structure:structures(
        *,
        profile:profiles(*)
      ),
      professional:professionals(
        *,
        profile:profiles(*)
      )
    `,
      { count: 'exact' }
    )
    .eq('structure_id', structureId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    count: count ?? 0,
    data: (data ?? []) as ProfessionalRatingWithRelations[],
  };
};
