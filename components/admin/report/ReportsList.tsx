'use client';

import { useTranslations } from 'next-intl';

import { useReports } from '@/hooks/admin/useReports';

import { ReportTable } from './ReportTable';

interface ReportsListProps {
  locale?: string;
}

export function ReportsList({ locale = 'en' }: ReportsListProps) {
  const t = useTranslations('admin.reports');
  const { data: reports = [], error, isLoading } = useReports();

  const translations = {
    contents: t('contentsColumn'),
    createdAt: t('createdAt'),
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

  if (reports.length === 0) {
    return (
      <div className='py-8 text-center text-gray-500'>{t('noReports')}</div>
    );
  }

  return (
    <ReportTable data={reports} locale={locale} translations={translations} />
  );
}
