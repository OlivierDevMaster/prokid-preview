'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { StructureMissionCard } from '@/features/structure/dashboard/StructureMissionCard';
import { MissionDetailsDialog } from '@/features/structure/missions/components/MissionDetailsDialog';
import { useGetMission } from '@/features/structure/missions/hooks/useGetMission';
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

  const [selectedMissionId, setSelectedMissionId] = useState<null | string>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: selectedMission, isLoading: isLoadingMission } =
    useGetMission(selectedMissionId);

  const handleMissionClick = (missionId: string) => {
    setSelectedMissionId(missionId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMissionId(null);
  };

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
              onClick={() => handleMissionClick(mission.id)}
            />
          ))}
        </div>
      ) : (
        <p className='text-sm text-gray-600'>{tMissions('noMissions')}</p>
      )}

      <MissionDetailsDialog
        isLoading={isLoadingMission}
        mission={selectedMission ?? null}
        onClose={handleCloseDialog}
        open={isDialogOpen}
      />
    </div>
  );
}
