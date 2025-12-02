'use client';

import { useQuery } from '@tanstack/react-query';

import type { Report } from '@/services/admin/reports/report.types';

export function useReports() {
  return useQuery({
    queryFn: fetchReports,
    queryKey: ['reports'],
  });
}

async function fetchReports(): Promise<Report[]> {
  const response = await fetch('/api/reports');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch reports');
  }

  return data.reports || [];
}
