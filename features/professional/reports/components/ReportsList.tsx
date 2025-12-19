'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TableHeaderActions from '@/features/admin/components/TableHeaderActions';
import { useStructuresForProfessional } from '@/features/structure-members/hooks/useStructuresForProfessional';

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

  const { data: structuresData } = useStructuresForProfessional(
    professionalId,
    {},
    { limit: 1000, page: 1 }
  );

  const structures = structuresData?.data ?? [];

  const {
    data: reports = [],
    error,
    isLoading,
  } = useReports(structureId && structureId !== 'all' ? structureId : null);
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
    return <div className='py-8 text-center text-gray-500'>{t('loading')}</div>;
  }

  if (error) {
    return <div className='py-8 text-center text-red-500'>{t('error')}</div>;
  }

  return (
    <>
      <div className='min-h-screen space-y-8 bg-blue-50/30 p-8'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
          <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
        </div>

        <div className='flex justify-between'>
          <Select onValueChange={setStructureId} value={structureId}>
            <SelectTrigger className='w-[250px]'>
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
                  t('unknownStructure') ||
                  'Unknown';
                return (
                  <SelectItem key={structure.user_id} value={structure.user_id}>
                    {structureName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <TableHeaderActions actions={actions} />
        </div>

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
