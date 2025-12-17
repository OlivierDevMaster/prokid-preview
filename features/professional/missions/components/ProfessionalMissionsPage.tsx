'use client';

import { useTranslations } from 'next-intl';
import { parseAsInteger, useQueryState } from 'nuqs';

import { useGetProfessionalMissions } from '@/features/missions/hooks/useGetProfessionalMissions';
import { MissionConfig } from '@/features/missions/mission.config';
import { Pagination } from '@/features/paginations/components/Pagination';

import { ProfessionalMissionCard } from './ProfessionalMissionCard';

export function ProfessionalMissionsPage() {
  const t = useTranslations('professional.missions');

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(MissionConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(MissionConfig.PAGE_SIZE_DEFAULT)
  );

  const { data: missionsData, isLoading } = useGetProfessionalMissions(
    {},
    { limit: pageSize, page }
  );

  const missions = missionsData?.data ?? [];
  const totalCount = missionsData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleViewDetails = (id: string) => {
    console.log('View details for mission:', id);
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
    </div>
  );
}
