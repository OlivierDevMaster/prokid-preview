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
      className='flex cursor-pointer items-start gap-4 p-4 transition-colors hover:bg-slate-50'
      href={`/structure/reports?reportId=${report.id}`}
    >
      <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100'>
        <FileText className='h-5 w-5 text-emerald-600' />
      </div>

      <div className='flex flex-1 flex-col gap-1'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-bold uppercase tracking-wide text-slate-400'>
            {report.mission_id
              ? `Mission #${report.mission_id.slice(0, 4)}`
              : ''}
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold',
              isDraft
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-emerald-100 text-emerald-700'
            )}
          >
            {isDraft ? '🟡 Brouillon' : '🟢 Reçu'}
          </span>
        </div>
        <h3 className='mt-1 line-clamp-1 text-sm font-semibold text-slate-900'>
          {report.title}
        </h3>
        {(professionalName || formattedDate) && (
          <p className='mt-1 text-xs text-slate-500'>
            {professionalName && <span>{professionalName}</span>}
            {professionalName && formattedDate && <span> • </span>}
            {formattedDate && <span>{formattedDate}</span>}
          </p>
        )}
      </div>
    </Link>
  );
}
