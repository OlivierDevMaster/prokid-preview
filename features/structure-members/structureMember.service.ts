import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { createClient } from '@/lib/supabase/client';

import type {
  StructureMemberFilters,
  StructureMemberWithProfessional,
  StructureMemberWithStructure,
} from './structureMember.model';

import { StructureMemberConfig } from './structureMember.config';

export const getStructuresForProfessional = async (
  professionalId: string,
  filters: StructureMemberFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<StructureMemberWithStructure>> => {
  const supabase = createClient();

  let query = supabase
    .from('structure_members')
    .select(
      `
        *,
        structure:structures(
          *,
          profile:profiles(*)
        )
      `,
      { count: 'exact' }
    )
    .eq('professional_id', professionalId);

  if (!filters.includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const page = paginationOptions.page ?? StructureMemberConfig.PAGE_DEFAULT;
  const limit =
    paginationOptions.limit ?? StructureMemberConfig.PAGE_SIZE_DEFAULT;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: (data ?? []) as StructureMemberWithStructure[],
  };
};

export const getProfessionalsForStructure = async (
  structureId: string,
  filters: StructureMemberFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<StructureMemberWithProfessional>> => {
  const supabase = createClient();

  let query = supabase
    .from('structure_members')
    .select(
      `
        *,
        professional:professionals(
          *,
          profile:profiles(*)
        )
      `,
      { count: 'exact' }
    )
    .eq('structure_id', structureId);

  if (!filters.includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const page = paginationOptions.page ?? StructureMemberConfig.PAGE_DEFAULT;
  const limit =
    paginationOptions.limit ?? StructureMemberConfig.PAGE_SIZE_DEFAULT;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: (data ?? []) as StructureMemberWithProfessional[],
  };
};

export const removeMemberFromStructure = async (
  membershipId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('structure_members')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', membershipId)
    .is('deleted_at', null);

  if (error) throw error;
};

export const leaveStructure = async (membershipId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('structure_members')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', membershipId)
    .is('deleted_at', null);

  if (error) throw error;
};
