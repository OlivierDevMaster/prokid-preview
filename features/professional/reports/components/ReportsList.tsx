'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo } from 'react';

import { Loader2 } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TableHeaderActions from '@/features/admin/components/TableHeaderActions';
import { useStructuresForProfessional } from '@/features/structure-members/hooks/useStructuresForProfessional';

import { useGetMissions } from '../hooks/useGetMissions';
import { useReports } from '../hooks/useReports';
import useReportTableHeaderActions from '../hooks/useReportTableHeaderActions';
import { ReportTable } from './ReportTable';

interface ReportsListProps {
  locale?: string;
}

export function ReportsList({ locale = 'en' }: ReportsListProps) {
  const t = useTranslations('admin.reports');
  const { data: session } = useSession();
  const professionalId = session?.user?.id ?? '';

  const [structureId, setStructureId] = useQueryState(
    'structure',
    parseAsString.withDefault('all')
  );

  const [missionId, setMissionId] = useQueryState(
    'mission',
    parseAsString.withDefault('all')
  );

  const { data: structuresData } = useStructuresForProfessional(
    professionalId,
    {},
    { limit: 1000, page: 1 }
  );

  const { data: missionsData } = useGetMissions();

  const structures = structuresData?.data ?? [];
  const allMissions = useMemo(
    () => missionsData?.data ?? [],
    [missionsData?.data]
  );

  // Filter missions based on selected structure
  const filteredMissions =
    structureId && structureId !== 'all'
      ? allMissions.filter(mission => mission.structure_id === structureId)
      : allMissions;

  // Reset mission filter when structure changes and current mission doesn't belong to new structure
  useEffect(() => {
    if (
      structureId &&
      structureId !== 'all' &&
      missionId &&
      missionId !== 'all'
    ) {
      const currentMission = allMissions.find(m => m.id === missionId);
      if (currentMission && currentMission.structure_id !== structureId) {
        setMissionId('all');
      }
    }
  }, [structureId, missionId, allMissions, setMissionId]);

  const {
    data: reports = [],
    error,
    isLoading,
  } = useReports(
    structureId && structureId !== 'all' ? structureId : null,
    missionId && missionId !== 'all' ? missionId : null
  );
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
    structure: t('structureColumn'),
    title: t('titleColumn'),
    view: t('view'),
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-8 text-center text-sm text-red-500 sm:text-base'>
        {t('error')}
      </div>
    );
  }

  return (
    <>
      <div className='min-h-screen space-y-4 bg-white p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
        {/* Header */}
        <div>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            {t('title')}
          </h1>
          <p className='mt-2 text-sm text-gray-600 sm:text-base'>
            {t('subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-col gap-3 sm:flex-row sm:gap-4'>
            <Select onValueChange={setStructureId} value={structureId}>
              <SelectTrigger className='w-full sm:w-[250px]'>
                <SelectValue
                  placeholder={t('filterByStructure') || 'Filter by structure'}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>
                  {t('allStructures') || 'All structures'}
                </SelectItem>
                {structures.map(structureMember => {
                  const structure = structureMember.structure;
                  const structureName =
                    structure.name ||
                    structure.profile?.email ||
                    t('unknownStructure');
                  return (
                    <SelectItem
                      key={structure.user_id}
                      value={structure.user_id}
                    >
                      {structureName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select onValueChange={setMissionId} value={missionId}>
              <SelectTrigger className='w-full sm:w-[250px]'>
                <SelectValue
                  placeholder={t('filterByMission') || 'Filter by mission'}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>
                  {t('allMissions') || 'All missions'}
                </SelectItem>
                {filteredMissions.map(mission => {
                  const missionTitle = mission.title || t('unknownMission');
                  return (
                    <SelectItem key={mission.id} value={mission.id}>
                      {missionTitle}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className='flex-shrink-0'>
            <TableHeaderActions actions={actions} />
          </div>
        </div>

        {reports.length === 0 && (
          <div className='flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-12 shadow-sm'>
            <p className='text-sm text-slate-500 sm:text-base'>{t('noReports')}</p>
          </div>
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
