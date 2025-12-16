'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';

import { useGetMissions } from '../hooks/useGetMissions';
import { MissionCard } from './MissionCard';

export function MissionsPage() {
  const t = useTranslations('structure.missions');
  const router = useRouter();
  const { data: missionsData, isLoading } = useGetMissions();

  const missions = missionsData?.data ?? [];

  const handleAddMission = () => {
    router.push('/structure/invitations/new');
  };

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
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>{t('title')}</h1>
          <p className='mt-2 text-gray-600'>{t('description')}</p>
        </div>
        <Button
          className='rounded-lg bg-blue-400 text-white hover:bg-blue-500'
          onClick={handleAddMission}
        >
          <Plus className='mr-2 h-4 w-4' />
          {t('addMission')}
        </Button>
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
          <Button
            className='mt-4 bg-blue-500 text-white hover:bg-blue-600'
            onClick={handleAddMission}
          >
            <Plus className='mr-2 h-4 w-4' />
            {t('addMission')}
          </Button>
        </div>
      )}
    </div>
  );
}
