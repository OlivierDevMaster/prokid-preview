'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText } from 'lucide-react';

import type { Report } from '@/services/admin/reports/report.types';

import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface ProfessionalReportCardProps {
  report: Report;
}

export function ProfessionalReportCard({
  report,
}: ProfessionalReportCardProps) {
  const formattedDate = report.created_at
    ? format(new Date(report.created_at), 'd MMM', { locale: fr })
    : '';

  const isDraft = report.status === 'draft';

  return (
    <Link
      className='flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50'
      href={`/professional/reports/${report.id}`}
    >
      {/* Icon */}
      <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100'>
        <FileText className='h-6 w-6 text-green-600' />
      </div>

      {/* Report details */}
      <div className='flex flex-1 flex-col gap-1'>
        <h3 className='font-bold text-gray-900'>{report.title}</h3>
        <p className='text-sm text-gray-600'>{formattedDate}</p>
      </div>

      {/* Status badge */}
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-1.5',
          isDraft
            ? 'border border-green-200 bg-green-50'
            : 'border border-blue-200 bg-blue-50'
        )}
      >
        <span
          className={cn(
            'text-xs font-medium',
            isDraft ? 'text-green-700' : 'text-blue-700'
          )}
        >
          {isDraft ? 'Rédigé' : 'Envoyé'}
        </span>
      </div>
    </Link>
  );
}
