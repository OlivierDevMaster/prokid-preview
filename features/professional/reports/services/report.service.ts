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
  recipient_id: string;
  title: string;
};

export async function createUserReport(
  report: ReportInsert
): Promise<null | Report> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .insert(report)
      .select(
        `
        *,
        author:professionals(
          *,
          profile:profiles(*)
        ),
        recipient:structures(
          *,
          profile:profiles(*)
        )
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
        recipient:structures(
          *,
          profile:profiles(*)
        )
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

    // Then, fetch the structure separately using recipient_id
    const { data: structure, error: structureError } = await supabase
      .from('structures')
      .select(
        `
        *,
        profile:profiles(*)
      `
      )
      .eq('user_id', report.recipient_id)
      .maybeSingle();

    if (structureError) {
      throw structureError;
    }

    return {
      report,
      structure: structure ?? null,
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

export async function getUserReports2(): Promise<Report[]> {
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
    const { data: reports, error: reportError } = await supabase
      .from('reports')
      .select(
        `
        *,
        author:professionals(
          *,
          profile:profiles(*)
        ),
        recipient:structures(
          *,
          profile:profiles(*)
        )
      `
      )
      .eq('author_id', userId);

    if (reportError) {
      throw reportError;
    }

    return reports;
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
        recipient:structures(
          *,
          profile:profiles(*)
        )
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
