'use client';

import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

import { useRecentReportsBetween } from '@/features/chat/hooks/useRecentReportsBetween';

import type { ViewRole } from '../types/chat.types';

export interface RecentReportsSectionProps {
  professionalId: null | string;
  structureId: null | string;
  viewRole: ViewRole;
}

export function RecentReportsSection({
  professionalId,
  structureId,
  viewRole,
}: RecentReportsSectionProps) {
  const t = useTranslations('chat');
  const { data: reports, isLoading } = useRecentReportsBetween(
    structureId,
    professionalId,
    viewRole
  );

  return (
    <section className='mb-4'>
      <h4 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        {t('recentReports')}
      </h4>
      {isLoading ? (
        <p className='text-sm text-muted-foreground'>
          {t('recentReportsEmpty')}
        </p>
      ) : reports.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          {t('recentReportsEmpty')}
        </p>
      ) : (
        <ul className='space-y-2'>
          {reports.map(report => (
            <li className='flex flex-col gap-0.5' key={report.id}>
              <span className='truncate text-sm font-medium'>
                {report.title || report.content?.slice(0, 50) || '—'}
              </span>
              <span className='text-xs text-muted-foreground'>
                {format(new Date(report.created_at), 'dd MMM yyyy')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
