import type { Report } from '@/features/reports/report.model';

import { createClient } from '@/lib/supabase/client';

type GetReportResponse = {
  report: null | Report;
};

export async function getProfessionalReport(
  reportId: string
): Promise<GetReportResponse> {
  try {
    const supabase = createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError && !session?.user) {
      throw sessionError;
    }

    const professionalId = session?.user.id ?? '';

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
      return { report: null };
    }

    // Verify the report belongs to this professional
    if (report.author_id !== professionalId) {
      return { report: null };
    }

    return { report };
  } catch (error) {
    console.error('Error fetching professional report:', error);
    throw error;
  }
}
