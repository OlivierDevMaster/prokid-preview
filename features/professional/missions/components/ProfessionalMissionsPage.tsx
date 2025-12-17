'use client';

import { useTranslations } from 'next-intl';

import { useGetProfessionalMissions } from '@/features/missions/hooks/useGetProfessionalMissions';

import { ProfessionalMissionCard } from './ProfessionalMissionCard';

export function ProfessionalMissionsPage() {
  const t = useTranslations('professional.missions');
  const { data: missionsData, isLoading } = useGetProfessionalMissions();

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
    </div>
  );
}
