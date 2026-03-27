'use client';

import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useGetProfessionalMissions } from '@/features/missions/hooks/useGetProfessionalMissions';
import { ProfessionalMissionCard } from '@/features/professional/missions/components/ProfessionalMissionCard';
import { ProfessionalMissionDetailsDialog } from '@/features/professional/missions/components/ProfessionalMissionDetailsDialog';
import { useGetProfessionalMission } from '@/features/professional/missions/hooks/useGetProfessionalMission';
import { Link } from '@/i18n/routing';

export function ProfessionalDashboardMissionsSection() {
  const tDashboard = useTranslations('professional.dashboard');
  const tMissions = useTranslations('professional.missions');

  const { data: missionsData, isLoading: isLoadingMissions } =
    useGetProfessionalMissions({}, { limit: 5, page: 1 });

  const missions = missionsData?.data ?? [];

  const [selectedMissionId, setSelectedMissionId] = useState<null | string>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: selectedMission, isLoading: isLoadingMission } =
    useGetProfessionalMission(selectedMissionId);

  const handleViewDetails = (id: string) => {
    setSelectedMissionId(id);
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
        <Link
          className='text-sm font-semibold text-[#4A90E2] hover:underline'
          href='/professional/missions'
        >
          {tDashboard('missionHistoryLink')}
        </Link>
      </div>
      {isLoadingMissions ? (
        <p className='text-sm text-slate-600'>{tMissions('loading')}</p>
      ) : missions.length > 0 ? (
        <div className='space-y-4'>
          {missions.map(mission => (
            <ProfessionalMissionCard
              key={mission.id}
              mission={mission}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <p className='text-sm text-slate-600'>{tMissions('noMissions')}</p>
      )}

      <ProfessionalMissionDetailsDialog
        isLoading={isLoadingMission}
        mission={selectedMission ?? null}
        onClose={handleCloseDialog}
        open={isDialogOpen}
      />
    </section>
  );
}
