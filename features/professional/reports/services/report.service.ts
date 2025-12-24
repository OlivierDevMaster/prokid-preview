import type { Report, ReportUpdate } from '@/features/reports/report.model';

import { Structure } from '@/features/structures/structure.model';
import { createClient } from '@/lib/supabase/client';
import { callSupabaseFunction } from '@/lib/supabase/functions';

type GetReportResponse = {
  report: null | Report;
  structure: null | Structure;
};

type ReportInsert = {
  author_id: string;
  content: string;
  mission_id: string;
  title: string;
};

export async function createUserReport(
  report: ReportInsert
): Promise<null | Report> {
  try {
    const supabase = await createClient();
    // Ensure status is set to 'draft' when creating
    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...report,
        status: 'draft',
      })
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
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error creating report:', error);
    throw error;
  }
}

export async function getReport(reportId: string): Promise<GetReportResponse> {
  try {
    const supabase = await createClient();

    // First, fetch the report
    const { data: report, error: reportError } = await supabase
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

    if (reportError) {
      throw reportError;
    }

    if (!report) {
      return {
        report: null,
        structure: null,
      };
    }

    // Extract structure from mission
    const structure = report.mission?.structure ?? null;

    return {
      report,
      structure,
    };
  } catch (error) {
    console.error('Unexpected error fetching reports:', error);
    throw error;
  }
}

export async function getUserReports(): Promise<Report[]> {
  try {
    const result = await callSupabaseFunction<Report[]>('reports', {
      method: 'GET',
    });

    if (result.error) {
      console.error('Error fetching reports:', result.error);
      throw new Error(result.error);
    }

    return result.data || [];
  } catch (error) {
    console.error('Unexpected error fetching reports:', error);
    throw error;
  }
}

export async function getUserReports2(
  structureId?: null | string,
  missionId?: null | string
): Promise<Report[]> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError && !session?.user) {
      throw sessionError;
    }

    const userId = session?.user.id ?? '';

    // If missionId is provided, filter directly by mission
    if (missionId && missionId !== 'all') {
      const query = supabase
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
        .eq('author_id', userId)
        .eq('mission_id', missionId);

      const { data: reports, error: reportError } = await query;

      if (reportError) {
        throw reportError;
      }

      return reports || [];
    }

    // If structureId is provided and not 'all', first get mission IDs for that structure
    let missionIds: string[] | undefined;
    if (structureId && structureId !== 'all') {
      const { data: missions, error: missionsError } = await supabase
        .from('missions')
        .select('id')
        .eq('structure_id', structureId);

      if (missionsError) {
        throw missionsError;
      }

      missionIds = missions?.map(m => m.id) ?? [];

      // If no missions found for this structure, return empty array
      if (missionIds.length === 0) {
        return [];
      }
    }

    let query = supabase
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
      .eq('author_id', userId);

    // Filter by structure if provided
    if (missionIds && missionIds.length > 0) {
      query = query.in('mission_id', missionIds);
    }

    const { data: reports, error: reportError } = await query;

    if (reportError) {
      throw reportError;
    }

    return reports || [];
  } catch (error) {
    console.error('Unexpected error fetching reports:', error);
    throw error;
  }
}

export async function updateUserReport(
  reportId: string,
  report: ReportUpdate
): Promise<null | Report> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .update(report)
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
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error updating report:', error);
    throw error;
  }
}
