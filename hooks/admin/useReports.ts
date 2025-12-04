'use client';

import { useQuery } from '@tanstack/react-query';

import type { Report } from '@/services/admin/reports/report.types';

import { callSupabaseFunction } from '@/lib/supabase/functions';

export function useReports() {
  return useQuery({
    queryFn: fetchReports,
    queryKey: ['reports'],
  });
}

async function fetchReports(): Promise<Report[]> {
  const result = await callSupabaseFunction<{ reports: Report[] }>(
    'get-reports',
    {
      method: 'GET',
    }
  );

  if (result.error) {
    throw new Error(result.error);
  }

  // Handle new standardized response format
  const data = result.data;
  if (!data) {
    return [];
  }

  // Support both old format { reports: [] } and new format { data: { reports: [] } }
  if ('reports' in data) {
    return data.reports || [];
  }

  return [];
}
