'use client';

import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useMemo, useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

import useReportColumnDefs from '../hooks/useReportColumnDefs';
import { useReports } from '../hooks/useReports';
import { ReportDetailsDialog } from './ReportDetailsDialog';
import { ReportTable } from './ReportTable';

interface ReportsListProps {
  locale?: string;
}

export function ReportsList({ locale = 'en' }: ReportsListProps) {
  const t = useTranslations('admin.reports');
  const tCommon = useTranslations('common.messages');
  const { handleClearSelection } = useSelectedProfessional();
  const [selectedReportId, setSelectedReportId] = useState<null | string>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    handleClearSelection();
  }, [handleClearSelection]);

  const [professionalId, setProfessionalId] = useQueryState(
    'professional',
    parseAsString.withDefault('all')
  );

  const [missionId, setMissionId] = useQueryState(
    'mission',
    parseAsString.withDefault('all')
  );

  // Fetch ALL reports, filter client-side
  const {
    data: allReports = [],
    error,
    isLoading,
  } = useReports(null, null);

  // Extract unique professionals from reports
  const professionals = useMemo(() => {
    const map = new Map<string, string>();
    allReports.forEach(r => {
      const id = r.author?.profile?.user_id;
      const name = [r.author?.profile?.first_name, r.author?.profile?.last_name]
        .filter(Boolean)
        .join(' ');
      if (id && name) map.set(id, name);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [allReports]);

  // Extract unique missions from reports (filtered by selected pro)
  const missions = useMemo(() => {
    const map = new Map<string, string>();
    allReports.forEach(r => {
      if (professionalId !== 'all' && r.author?.profile?.user_id !== professionalId) return;
      const id = r.mission?.id;
      const title = r.mission?.title;
      if (id && title) map.set(id, title);
    });
    return Array.from(map, ([id, title]) => ({ id, title }));
  }, [allReports, professionalId]);

  // Reset mission filter when pro changes
  useEffect(() => {
    setMissionId('all');
  }, [professionalId, setMissionId]);

  // Client-side filtering
  const reports = useMemo(() => {
    return allReports.filter(r => {
      if (professionalId !== 'all' && r.author?.profile?.user_id !== professionalId) return false;
      if (missionId !== 'all' && r.mission?.id !== missionId) return false;
      return true;
    });
  }, [allReports, professionalId, missionId]);

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedReportId(null);
  };

  const { columns } = useReportColumnDefs({
    locale,
    onViewReport: handleViewReport,
    translations: {
      contents: t('contentsColumn'),
      createdAt: t('createdAt'),
      mission: t('mission'),
      next: t('next'),
      noResults: t('noResults'),
      of: t('of'),
      page: t('page'),
      previous: t('previous'),
      professional: t('professionalColumn') || 'Professional',
      title: t('titleColumn'),
      unknown: tCommon('unknown'),
      view: t('view'),
    },
  });

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f6f6f8]'>
        <div className='border-b border-slate-200 bg-white px-6 py-6 md:px-10'>
          <div className='mx-auto max-w-7xl'>
            <div className='h-8 w-48 animate-pulse rounded-lg bg-slate-200' />
            <div className='mt-2 h-4 w-72 animate-pulse rounded bg-slate-100' />
          </div>
        </div>
        <div className='px-6 py-8 md:px-10'>
          <div className='mx-auto max-w-7xl'>
            <div className='h-64 animate-pulse rounded-xl bg-white' />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className='py-8 text-center text-red-500'>{t('error')}</div>;
  }

  return (
    <div className='min-h-screen bg-[#f6f6f8] text-slate-900'>
      {/* Header — same style as dashboard */}
      <header className='border-b border-slate-200 bg-white px-6 py-6 md:px-10'>
        <div className='mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
              {t('title')}
            </h1>
            <p className='mt-0.5 text-sm font-medium text-slate-500'>
              {t('subtitle')}
            </p>
          </div>

          {/* Filters — dashboard button style */}
          <div className='flex w-full gap-3 md:w-auto'>
            <Select onValueChange={setProfessionalId} value={professionalId}>
              <SelectTrigger className='h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 md:w-[220px]'>
                <SelectValue
                  placeholder={t('filterByProfessional')}
                />
              </SelectTrigger>
              <SelectContent className='rounded-xl'>
                <SelectItem value='all'>
                  {t('allProfessionals')}
                </SelectItem>
                {professionals.map(pro => (
                  <SelectItem key={pro.id} value={pro.id}>
                    {pro.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setMissionId} value={missionId}>
              <SelectTrigger className='h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 md:w-[220px]'>
                <SelectValue
                  placeholder={t('filterByMission')}
                />
              </SelectTrigger>
              <SelectContent className='rounded-xl'>
                <SelectItem value='all'>
                  {t('allMissions')}
                </SelectItem>
                {missions.map(mission => (
                  <SelectItem key={mission.id} value={mission.id}>
                    {mission.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className='px-6 py-6 md:px-10 md:py-8'>
        <div className='mx-auto max-w-7xl'>
          {reports.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100'>
                <FileText className='h-8 w-8 text-slate-400' />
              </div>
              <h3 className='text-lg font-semibold text-slate-900'>
                {t('noReports')}
              </h3>
              <p className='mt-1 text-sm text-slate-500'>
                Les rapports de vos professionnels apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
              <ReportTable
                columns={columns}
                data={reports}
                locale={locale}
                onRowClick={handleViewReport}
                translations={{
                  contents: t('contentsColumn'),
                  createdAt: t('createdAt'),
                  mission: t('mission'),
                  next: t('next'),
                  noResults: t('noResults'),
                  of: t('of'),
                  page: t('page'),
                  previous: t('previous'),
                  professional: t('professionalColumn') || 'Professional',
                  title: t('titleColumn'),
                  view: t('view'),
                }}
              />
            </div>
          )}
        </div>
      </main>

      <ReportDetailsDialog
        isLoading={false}
        onClose={handleCloseDialog}
        open={isDialogOpen}
        reportId={selectedReportId}
      />
    </div>
  );
}
