'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText } from 'lucide-react';

import type { Report } from '@/features/reports/report.model';

import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface StructureReportCardProps {
  report: Report;
}

export function StructureReportCard({ report }: StructureReportCardProps) {
  const formattedDate = report.created_at
    ? format(new Date(report.created_at), 'd MMM', { locale: fr })
    : '';

  const isDraft = report.status === 'draft';

  const professionalName =
    report.author?.profile?.first_name || report.author?.profile?.last_name
      ? `${report.author.profile.first_name || ''} ${report.author.profile.last_name || ''}`.trim()
      : (report.author?.profile?.email ?? '');

  return (
    <Link
      className='flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-blue-50/60'
      href={`/structure/reports?reportId=${report.id}`}
    >
      {/* Icon */}
      <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100'>
        <FileText className='h-5 w-5 text-emerald-600' />
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col gap-1'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='line-clamp-1 text-sm font-semibold text-gray-900'>
            {report.title}
          </h3>
        </div>
        {(professionalName || formattedDate) && (
          <div className='flex items-center gap-2 text-xs text-gray-600'>
            {professionalName && (
              <span className='truncate'>{professionalName}</span>
            )}
            {formattedDate && (
              <span className='whitespace-nowrap text-gray-500'>
                {formattedDate}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status badge */}
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium',
          isDraft
            ? 'border border-purple-200 bg-purple-50 text-purple-700'
            : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
        )}
      >
        <span>{isDraft ? 'Brouillon' : 'Reçu'}</span>
      </div>
    </Link>
  );
}
