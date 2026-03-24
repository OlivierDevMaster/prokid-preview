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
    ? format(new Date(report.created_at), "'Soumis le' d MMMM", {
        locale: fr,
      })
    : '';

  const isDraft = report.status === 'draft';
  const missionShortId = report.mission_id
    ? report.mission_id.slice(0, 8).toUpperCase()
    : '';

  return (
    <div className='p-4 transition-colors hover:bg-slate-50'>
      <div className='mb-2 flex items-start justify-between'>
        <span className='text-xs font-bold uppercase tracking-wide text-slate-400'>
          {missionShortId ? `Mission #${missionShortId}` : ''}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-bold',
            isDraft
              ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
          )}
        >
          {isDraft ? 'ATTENDU' : 'REÇU'}
        </span>
      </div>
      <h3 className='mb-1 text-sm font-bold text-slate-900'>{report.title}</h3>
      <p className='mb-3 text-xs text-slate-500'>{formattedDate}</p>
      {isDraft ? (
        <span className='inline-block w-full rounded-lg bg-slate-100 py-2 text-center text-xs font-bold text-slate-400'>
          Non disponible
        </span>
      ) : (
        <Link
          className='inline-block w-full rounded-lg border border-slate-200 py-2 text-center text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50'
          href={`/professional/reports/${report.id}`}
        >
          <span className='flex items-center justify-center gap-1'>
            <FileText className='h-3.5 w-3.5' />
            Télécharger PDF
          </span>
        </Link>
      )}
    </div>
  );
}
