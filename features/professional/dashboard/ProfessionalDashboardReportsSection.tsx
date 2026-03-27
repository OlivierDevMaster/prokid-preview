'use client';

import { BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ProfessionalReportCard } from '@/features/professional/reports/components/ProfessionalReportCard';
import { useReports } from '@/features/professional/reports/hooks/useReports';
import { Link } from '@/i18n/routing';

export function ProfessionalDashboardReportsSection() {
  const tDashboard = useTranslations('professional.dashboard');

  const { data: reportsData, isLoading: isLoadingReports } = useReports();
  const reports = (reportsData ?? []).slice(0, 2);

  return (
    <section>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-xl font-bold text-slate-900'>
          <BarChart3 className='h-5 w-5 text-[#4A90E2]' />
          {tDashboard('reportsCardTitle')}
        </h2>
      </div>
      <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'>
        {isLoadingReports ? (
          <div className='p-4 text-sm text-slate-600'>Chargement...</div>
        ) : reports.length > 0 ? (
          <div className='divide-y divide-slate-100'>
            {reports.map(report => (
              <ProfessionalReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className='p-4 text-sm text-slate-500'>
            Aucun rapport pour le moment.
          </div>
        )}
        <div className='border-t border-slate-100 bg-slate-50 p-3 text-center'>
          <Link
            className='text-sm font-semibold text-[#4A90E2] hover:underline'
            href='/professional/reports'
          >
            Voir tous les rapports
          </Link>
        </div>
      </div>
    </section>
  );
}
