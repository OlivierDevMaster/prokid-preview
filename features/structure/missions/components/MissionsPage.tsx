'use client';

import { useTranslations } from 'next-intl';

import { useGetMissions } from '../hooks/useGetMissions';
import { MissionCard } from './MissionCard';

export function MissionsPage() {
  const t = useTranslations('structure.missions');
  const { data: missionsData, isLoading } = useGetMissions();

  const missions = missionsData?.data ?? [];

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
      <div>
        <h1 className='text-3xl font-bold text-gray-800'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('description')}</p>
      </div>

      {/* Missions Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {missions.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {missions.length === 0 && (
        <div className='py-12 text-center text-gray-500'>
          <p>{t('noMissions')}</p>
        </div>
      )}
    </div>
  );
}
