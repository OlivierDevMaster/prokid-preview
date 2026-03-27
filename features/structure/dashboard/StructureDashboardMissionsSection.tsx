'use client';

import { CalendarDays } from 'lucide-react';
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
    { limit: 5, page: 1 }
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
    <section>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-xl font-bold text-slate-900'>
          <CalendarDays className='h-5 w-5 text-[#4A90E2]' />
          {tDashboard('missionsCardTitle')}
        </h2>
      </div>
      {isLoadingMissions ? (
        <p className='text-sm text-slate-600'>{tMissions('loading')}</p>
      ) : missions.length > 0 ? (
        <div className='space-y-4'>
          {missions.map(mission => (
            <StructureMissionCard
              key={mission.id}
              mission={mission}
              onClick={() => handleMissionClick(mission.id)}
            />
          ))}
        </div>
      ) : (
        <p className='text-sm text-slate-600'>{tMissions('noMissions')}</p>
      )}

      <MissionDetailsDialog
        isLoading={isLoadingMission}
        mission={selectedMission ?? null}
        onClose={handleCloseDialog}
        open={isDialogOpen}
      />
    </section>
  );
}
