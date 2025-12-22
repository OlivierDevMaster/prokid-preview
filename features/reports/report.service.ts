import { createClient } from '@/lib/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

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

  // Ensure status is set to 'draft' if not provided
  const reportData = {
    ...insertData,
    status: insertData.status || 'draft',
  };

  const { data, error } = await supabase
    .from('reports')
    .insert(reportData)
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
        ),
        attachments:report_attachments(*)
      `
    )
    .single();

  if (error) {
    console.error('Error creating report:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create report: No data returned from database');
  }

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
        ),
        attachments:report_attachments(*)
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
        ),
        attachments:report_attachments(*)
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

  // If filtering by structureId, we need to get mission IDs first
  // because Supabase doesn't support filtering on nested relationship fields
  let missionIds: string[] | undefined;
  if (filters.structureId) {
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('id')
      .eq('structure_id', filters.structureId);

    if (missionsError) {
      throw missionsError;
    }

    missionIds = missions?.map(m => m.id) ?? [];

    // If no missions found for this structure, return empty result
    if (missionIds.length === 0) {
      return {
        count: 0,
        data: [],
      };
    }
  }

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
        ),
        attachments:report_attachments(*)
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

  if (filters.structureId && missionIds) {
    // Filter reports by mission IDs that belong to this structure
    query = query.in('mission_id', missionIds);
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

export type SendReportResponse = {
  emailId: null | string;
  message: string;
  reportId: string;
};

export const sendReport = async (
  reportId: string
): Promise<SendReportResponse> => {
  const supabase = createClient();

  return invokeEdgeFunction<SendReportResponse, { report_id: string }>(
    supabase,
    'reports',
    {
      body: { report_id: reportId },
      method: 'POST',
      path: '/send',
    }
  );
};

export const deleteReport = async (reportId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.from('reports').delete().eq('id', reportId);

  if (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};
