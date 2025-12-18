import type { Report } from '@/features/reports/report.model';

import { createClient } from '@/lib/supabase/client';

type GetReportResponse = {
  report: null | Report;
};

export async function getStructureReport(
  reportId: string
): Promise<GetReportResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError && !session?.user) {
      throw sessionError;
    }

    const structureId = session?.user.id ?? '';

    // First, verify the report belongs to a mission of this structure
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
      };
    }

    // Verify the report's mission belongs to this structure
    if (report.mission?.structure_id !== structureId) {
      return {
        report: null,
      };
    }

    return {
      report,
    };
  } catch (error) {
    console.error('Unexpected error fetching structure report:', error);
    throw error;
  }
}

export async function getStructureReports(
  professionalId?: null | string
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

    const structureId = session?.user.id ?? '';

    // Get all missions for this structure
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('id')
      .eq('structure_id', structureId);

    if (missionsError) {
      throw missionsError;
    }

    const missionIds = missions?.map(m => m.id) ?? [];

    // If no missions found for this structure, return empty array
    if (missionIds.length === 0) {
      return [];
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
      .in('mission_id', missionIds);

    // Filter by professional if provided
    if (professionalId && professionalId !== 'all') {
      query = query.eq('author_id', professionalId);
    }

    const { data: reports, error: reportError } = await query;

    if (reportError) {
      throw reportError;
    }

    return reports || [];
  } catch (error) {
    console.error('Unexpected error fetching structure reports:', error);
    throw error;
  }
}
