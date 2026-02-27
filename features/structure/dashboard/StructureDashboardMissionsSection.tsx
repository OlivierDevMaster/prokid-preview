'use client';

import { useTranslations } from 'next-intl';

import { StructureMissionCard } from '@/features/structure/dashboard/StructureMissionCard';
import { useGetMissions } from '@/features/structure/missions/hooks/useGetMissions';
import { Link } from '@/i18n/routing';

export function StructureDashboardMissionsSection() {
  const tDashboard = useTranslations('structure.dashboard');
  const tMissions = useTranslations('structure.missions');

  const { data: missionsData, isLoading: isLoadingMissions } = useGetMissions(
    {},
    { limit: 2, page: 1 }
  );
  const missions = missionsData?.data ?? [];

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>
          {tDashboard('missionsCardTitle')}
        </h2>
        <Link
          className='text-sm font-medium text-blue-600 hover:underline'
          href='/structure/missions'
        >
          {tDashboard('viewAll')}
        </Link>
      </div>
      {isLoadingMissions ? (
        <p className='text-sm text-gray-600'>{tMissions('loading')}</p>
      ) : missions.length > 0 ? (
        <div className='space-y-3'>
          {missions.map(mission => (
            <StructureMissionCard
              key={mission.id}
              mission={mission}
              onClick={() => {}}
            />
          ))}
        </div>
      ) : (
        <p className='text-sm text-gray-600'>{tMissions('noMissions')}</p>
      )}
    </div>
  );
}
