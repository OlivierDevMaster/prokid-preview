'use client';

import { useTranslations } from 'next-intl';

import TableHeaderActions from '@/features/admin/components/TableHeaderActions';

import { useReports } from '../hooks/useReports';
import useReportTableHeaderActions from '../hooks/useReportTableHeaderActions';
import { ReportTable } from './ReportTable';

interface ReportsListProps {
  locale?: string;
}

export function ReportsList({ locale = 'en' }: ReportsListProps) {
  const t = useTranslations('admin.reports');
  const { data: reports = [], error, isLoading } = useReports();
  const actions = useReportTableHeaderActions();

  const translations = {
    contents: t('contentsColumn'),
    createdAt: t('createdAt'),
    mission: t('mission'),
    next: t('next'),
    noResults: t('noResults'),
    of: t('of'),
    page: t('page'),
    previous: t('previous'),
    title: t('titleColumn'),
    view: t('view'),
  };

  if (isLoading) {
    return <div className='py-8 text-center text-gray-500'>{t('loading')}</div>;
  }

  if (error) {
    return <div className='py-8 text-center text-red-500'>{t('error')}</div>;
  }

  return (
    <>
      <div className='space-y-8 bg-blue-50/30 p-8'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
          <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
        </div>

        <TableHeaderActions actions={actions} />

        {reports.length === 0 && (
          <div className='py-8 text-center text-gray-500'>{t('noReports')}</div>
        )}
        {reports.length > 0 && (
          <ReportTable
            data={reports}
            locale={locale}
            translations={translations}
          />
        )}
      </div>
    </>
  );
}
