"use client";

import { useQuery } from "@tanstack/react-query";
import type { Report } from "@/services/admin/reports/report.types";

async function fetchReports(): Promise<Report[]> {
  const response = await fetch("/api/reports");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch reports");
  }

  return data.reports || [];
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
  });
}

