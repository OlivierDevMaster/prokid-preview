import type { Report } from '@/services/admin/reports/report.types';

import { createClient } from '@/lib/supabase/client';
import { callSupabaseFunction } from '@/lib/supabase/functions';

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
    const result = await callSupabaseFunction<Report>('reports', {
      body: {
        content: report.content,
        recipient_id: report.recipient_id,
        title: report.title,
      },
      method: 'POST',
    });

    if (result.error) {
      console.error('Error creating report:', result.error);
      throw new Error(result.error);
    }

    if (!result.data) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Unexpected error creating report:', error);
    throw error;
  }
}

export async function getUserReports(userId: string): Promise<Report[]> {
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

export async function getUserReports2(userId: string): Promise<Report[]> {
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
