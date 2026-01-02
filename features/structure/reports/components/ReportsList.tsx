'use client';

import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetMissions } from '@/features/structure/missions/hooks/useGetMissions';
import { useGetProfessionals } from '@/features/structure/professionals/hooks/useGetProfessionals';

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
  const [selectedReportId, setSelectedReportId] = useState<null | string>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [professionalId, setProfessionalId] = useQueryState(
    'professional',
    parseAsString.withDefault('all')
  );

  const [missionId, setMissionId] = useQueryState(
    'mission',
    parseAsString.withDefault('all')
  );

  const { data: professionalsData } = useGetProfessionals(
    {},
    { limit: 1000, page: 1 }
  );

  const professionals = professionalsData?.data ?? [];

  const { data: missionsData } = useGetMissions(
    professionalId && professionalId !== 'all'
      ? { professional_id: professionalId }
      : {},
    { limit: 1000, page: 1 }
  );

  const missions = missionsData?.data ?? [];

  useEffect(() => {
    setMissionId('all');
  }, [professionalId, setMissionId]);

  const {
    data: reports = [],
    error,
    isLoading,
  } = useReports(
    professionalId && professionalId !== 'all' ? professionalId : null,
    missionId && missionId !== 'all' ? missionId : null
  );

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
    return <div className='py-8 text-center text-gray-500'>{t('loading')}</div>;
  }

  if (error) {
    return <div className='py-8 text-center text-red-500'>{t('error')}</div>;
  }

  return (
    <div className='min-h-screen space-y-8 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:p-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
      </div>

      <div className='flex justify-start gap-4'>
        <Select onValueChange={setProfessionalId} value={professionalId}>
          <SelectTrigger className='w-[250px]'>
            <SelectValue
              placeholder={
                t('filterByProfessional') || 'Filter by professional'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              {t('allProfessionals') || 'All professionals'}
            </SelectItem>
            {professionals.map(professional => (
              <SelectItem key={professional.id} value={professional.id}>
                {professional.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setMissionId} value={missionId}>
          <SelectTrigger className='w-[250px]'>
            <SelectValue
              placeholder={t('filterByMission') || 'Filter by mission'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              {t('allMissions') || 'All missions'}
            </SelectItem>
            {missions.map(mission => (
              <SelectItem key={mission.id} value={mission.id}>
                {mission.title || mission.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reports.length === 0 && (
        <div className='py-8 text-center text-gray-500'>{t('noReports')}</div>
      )}
      {reports.length > 0 && (
        <ReportTable
          columns={columns}
          data={reports}
          locale={locale}
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
      )}

      {/* Report Details Dialog */}
      <ReportDetailsDialog
        isLoading={false}
        onClose={handleCloseDialog}
        open={isDialogOpen}
        reportId={selectedReportId}
      />
    </div>
  );
}
