'use client';

import { useTranslations } from 'next-intl';

import { StructureReportCard } from '@/features/structure/dashboard/StructureReportCard';
import { useReports } from '@/features/structure/reports/hooks/useReports';
import { Link } from '@/i18n/routing';

export function StructureDashboardReportsSection() {
  const tDashboard = useTranslations('structure.dashboard');
  const tReports = useTranslations('admin.reports');

  const { data: reportsData, isLoading: isLoadingReports } = useReports();
  const reports = (reportsData ?? []).slice(0, 2);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>
          {tDashboard('reportsCardTitle')}
        </h2>
        <Link
          className='text-sm font-medium text-blue-600 hover:underline'
          href='/structure/reports'
        >
          {tDashboard('viewAll')}
        </Link>
      </div>
      {isLoadingReports ? (
        <p className='text-sm text-gray-600'>{tReports('loading')}</p>
      ) : reports.length > 0 ? (
        <div className='space-y-3'>
          {reports.map(report => (
            <StructureReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <p className='text-sm text-gray-600'>
          {tReports('noReports') || tReports('noResults')}
        </p>
      )}
    </div>
  );
}
