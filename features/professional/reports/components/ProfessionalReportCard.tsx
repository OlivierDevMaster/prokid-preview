'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Building2, FileText } from 'lucide-react';

import type { Report } from '@/services/admin/reports/report.types';

import { Link } from '@/i18n/routing';

interface ProfessionalReportCardProps {
  report: Report;
}

export function ProfessionalReportCard({
  report,
}: ProfessionalReportCardProps) {
  const formattedDate = report.created_at
    ? format(new Date(report.created_at), 'd MMM yyyy', { locale: fr })
    : '';

  // Get structure name from mission
  const structureName = (report as unknown as { mission?: { structure?: { name?: string } } })
    .mission?.structure?.name || 'Structure';

  return (
    <Link
      className='flex items-center gap-4 p-4 transition-colors hover:bg-slate-50'
      href='/professional/reports'
    >
      {/* Structure icon */}
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100'>
        <Building2 className='h-5 w-5 text-blue-600' />
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <h3 className='truncate text-sm font-semibold text-slate-900'>
          {report.title}
        </h3>
        <p className='mt-0.5 text-xs text-slate-500'>
          {structureName}
          {formattedDate && ` • ${formattedDate}`}
        </p>
      </div>

      {/* Icon */}
      <FileText className='h-4 w-4 shrink-0 text-slate-300' />
    </Link>
  );
}
