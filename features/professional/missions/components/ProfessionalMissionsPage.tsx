'use client';

import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetProfessionalMissions } from '@/features/missions/hooks/useGetProfessionalMissions';
import { MissionConfig } from '@/features/missions/mission.config';
import {
  MissionStatus,
  MissionStatusLabel,
} from '@/features/missions/mission.model';
import { Pagination } from '@/features/paginations/components/Pagination';
import { useStructuresForProfessional } from '@/features/structure-members/hooks/useStructuresForProfessional';

import { useGetProfessionalMission } from '../hooks/useGetProfessionalMission';
import { ProfessionalMissionCard } from './ProfessionalMissionCard';
import { ProfessionalMissionDetailsDialog } from './ProfessionalMissionDetailsDialog';

export function ProfessionalMissionsPage() {
  const t = useTranslations('professional.missions');
  const locale = useLocale() as 'en' | 'fr';
  const { data: session } = useSession();
  const professionalId = session?.user?.id ?? '';

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(MissionConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(MissionConfig.PAGE_SIZE_DEFAULT)
  );
  const [structureId, setStructureId] = useQueryState(
    'structure',
    parseAsString.withDefault('all')
  );
  const [status, setStatus] = useQueryState(
    'status',
    parseAsString.withDefault('all')
  );
  const [selectedMissionId, setSelectedMissionId] = useState<null | string>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: structuresData } = useStructuresForProfessional(
    professionalId,
    {},
    { limit: 1000, page: 1 }
  );

  const structures = structuresData?.data ?? [];

  const { data: missionsData, isLoading } = useGetProfessionalMissions(
    {
      ...(structureId && structureId !== 'all'
        ? { structure_id: structureId }
        : {}),
      ...(status && status !== 'all'
        ? { status: status as MissionStatus }
        : {}),
    },
    { limit: pageSize, page }
  );

  const { data: selectedMission, isLoading: isLoadingMission } =
    useGetProfessionalMission(selectedMissionId);

  const missions = missionsData?.data ?? [];
  const totalCount = missionsData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleViewDetails = (id: string) => {
    setSelectedMissionId(id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMissionId(null);
  };

  const handleStructureChange = (value: string) => {
    setStructureId(value);
    setPage(MissionConfig.PAGE_DEFAULT);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(MissionConfig.PAGE_DEFAULT);
  };

  if (isLoading) {
    return (
      <div className='-m-4 flex min-h-screen items-center justify-center bg-blue-50/30 p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8'>
        <p className='text-sm text-gray-600 sm:text-base'>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen space-y-4 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:p-8'>
      {/* Header */}
      <div className='mb-4 sm:mb-6'>
        <h1 className='text-2xl font-bold text-gray-800 sm:text-3xl'>
          {t('title')}
        </h1>
        <p className='mt-2 text-sm text-gray-600 sm:text-base'>
          {t('description')}
        </p>
      </div>

      {/* Filters */}
      <div className='mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:gap-4'>
        <Select onValueChange={handleStructureChange} value={structureId}>
          <SelectTrigger className='w-full sm:w-[250px]'>
            <SelectValue placeholder={t('filterByStructure')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allStructures')}</SelectItem>
            {structures.map(structureMember => {
              const structure = structureMember.structure;
              const structureName =
                structure.name ||
                structure.profile?.email ||
                t('unknownStructure');
              return (
                <SelectItem key={structure.user_id} value={structure.user_id}>
                  {structureName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select onValueChange={handleStatusChange} value={status}>
          <SelectTrigger className='w-full sm:w-[250px]'>
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allStatuses')}</SelectItem>
            <SelectItem value={MissionStatus.pending}>
              {MissionStatusLabel[locale].pending}
            </SelectItem>
            <SelectItem value={MissionStatus.accepted}>
              {MissionStatusLabel[locale].accepted}
            </SelectItem>
            <SelectItem value={MissionStatus.declined}>
              {MissionStatusLabel[locale].declined}
            </SelectItem>
            <SelectItem value={MissionStatus.cancelled}>
              {MissionStatusLabel[locale].cancelled}
            </SelectItem>
            <SelectItem value={MissionStatus.expired}>
              {MissionStatusLabel[locale].expired}
            </SelectItem>
            <SelectItem value={MissionStatus.ended}>
              {MissionStatusLabel[locale].ended}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Missions Grid */}
      {missions.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
          {missions.map(mission => (
            <ProfessionalMissionCard
              key={mission.id}
              mission={mission}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className='py-8 text-center text-gray-500 sm:py-12'>
          <p className='text-sm sm:text-base'>{t('noMissions')}</p>
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div className='mt-4 sm:mt-6 lg:mt-8'>
          <Pagination
            currentPage={page}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSize={pageSize}
            totalItems={totalCount}
            totalPages={totalPages}
          />
        </div>
      )}

      {/* Mission Details Dialog */}
      <ProfessionalMissionDetailsDialog
        isLoading={isLoadingMission}
        mission={selectedMission ?? null}
        onClose={handleCloseDialog}
        open={isDialogOpen}
      />
    </div>
  );
}
