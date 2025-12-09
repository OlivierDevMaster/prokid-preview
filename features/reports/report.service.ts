import { createClient } from '@/lib/supabase/client';

import type {
  Report,
  ReportFilters,
  ReportInsert,
  ReportUpdate,
} from './report.model';

import {
  PaginationOptions,
  PaginationResult,
} from '../paginations/pagination.model';
import { ReportConfig } from './report.config';

export const createReport = async (
  insertData: ReportInsert
): Promise<Report> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reports')
    .insert(insertData)
    .select(
      `
        *,
        author:professionals(
          *,
          profile:profiles(*)
        ),
        mission:missions(
          *,
          structure:structures(
            *,
            profile:profiles(*)
          )
        )
      `
    )
    .single();

  if (error) throw error;

  return data;
};

export const findReport = async (reportId: string): Promise<null | Report> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reports')
    .select(
      `
        *,
        author:professionals(
          *,
          profile:profiles(*)
        ),
        mission:missions(
          *,
          structure:structures(
            *,
            profile:profiles(*)
          )
        )
      `
    )
    .eq('id', reportId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const updateReport = async (
  reportId: string,
  updateData: ReportUpdate
): Promise<Report> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', reportId)
    .select(
      `
        *,
        author:professionals(
          *,
          profile:profiles(*)
        ),
        mission:missions(
          *,
          structure:structures(
            *,
            profile:profiles(*)
          )
        )
      `
    )
    .eq('id', reportId)
    .single();

  if (error) throw error;

  return data;
};

export const findReports = async (
  filters: ReportFilters,
  paginationOptions: PaginationOptions
): Promise<PaginationResult<Report>> => {
  const supabase = createClient();

  let query = supabase.from('reports').select(
    `
        *,
        author:professionals(
          *,
          profile:profiles(*)
        ),
        mission:missions(
          *,
          structure:structures(
            *,
            profile:profiles(*)
          )
        )
      `,
    { count: 'exact' }
  );

  if (filters.search) {
    query = query.ilike('content', `%${filters.search}%`);
    query = query.ilike('title', `%${filters.search}%`);
  }

  if (filters.authorSearch) {
    query = query.ilike(
      'author.profile.first_name',
      `%${filters.authorSearch}%`
    );
    query = query.ilike(
      'author.profile.last_name',
      `%${filters.authorSearch}%`
    );
  }

  if (filters.missionId) {
    query = query.eq('mission_id', filters.missionId);
  }

  if (filters.structureId) {
    query = query.eq('mission.structure_id', filters.structureId);
  }

  if (filters.authorId) {
    query = query.eq('author_id', filters.authorId);
  }

  const page = paginationOptions.page ?? ReportConfig.PAGE_DEFAULT;

  const limit = paginationOptions.limit ?? ReportConfig.PAGE_SIZE_DEFAULT;

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
