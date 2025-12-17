'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
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
import { Pagination } from '@/features/paginations/components/Pagination';
import { useStructuresForProfessional } from '@/features/structure-members/hooks/useStructuresForProfessional';

import { useGetProfessionalMission } from '../hooks/useGetProfessionalMission';
import { ProfessionalMissionCard } from './ProfessionalMissionCard';
import { ProfessionalMissionDetailsDialog } from './ProfessionalMissionDetailsDialog';

export function ProfessionalMissionsPage() {
  const t = useTranslations('professional.missions');
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

  if (isLoading) {
    return (
      <div className='-m-8 flex min-h-screen items-center justify-center bg-blue-50/30 p-8'>
        <p className='text-gray-600'>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen space-y-6 bg-blue-50/30 p-8'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('description')}</p>
      </div>

      {/* Filters */}
      <div className='mb-6 flex gap-4'>
        <Select onValueChange={handleStructureChange} value={structureId}>
          <SelectTrigger className='w-[250px]'>
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
      </div>

      {/* Missions Grid */}
      {missions.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {missions.map(mission => (
            <ProfessionalMissionCard
              key={mission.id}
              mission={mission}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className='py-12 text-center text-gray-500'>
          <p>{t('noMissions')}</p>
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div className='mt-8'>
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
