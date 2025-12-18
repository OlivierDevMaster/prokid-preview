'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetProfessionals } from '@/features/structure/professionals/hooks/useGetProfessionals';
import { useRouter } from '@/i18n/routing';

import { useGetMission } from '../hooks/useGetMission';
import { useGetMissions } from '../hooks/useGetMissions';
import { MissionCard } from './MissionCard';
import { MissionDetailsDialog } from './MissionDetailsDialog';

export function MissionsPage() {
  const t = useTranslations('structure.missions');
  const router = useRouter();
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    'all' | string
  >('all');
  const [selectedMissionId, setSelectedMissionId] = useState<null | string>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: professionalsData } = useGetProfessionals(
    {},
    { limit: 1000, page: 1 }
  );

  const professionals = professionalsData?.data ?? [];

  const { data: missionsData, isLoading } = useGetMissions({
    ...(selectedProfessionalId && selectedProfessionalId !== 'all'
      ? { professional_id: selectedProfessionalId }
      : {}),
  });

  const { data: selectedMission, isLoading: isLoadingMission } =
    useGetMission(selectedMissionId);

  const missions = missionsData?.data ?? [];

  const handleViewDetails = (id: string) => {
    setSelectedMissionId(id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMissionId(null);
  };

  const handleCreateMission = () => {
    router.push('/structure/missions/new');
  };

  const handleProfessionalChange = (value: string) => {
    setSelectedProfessionalId(value);
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
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>{t('title')}</h1>
          <p className='mt-2 text-gray-600'>{t('description')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex justify-between gap-4'>
        <Select
          onValueChange={handleProfessionalChange}
          value={selectedProfessionalId}
        >
          <SelectTrigger className='w-[250px]'>
            <SelectValue placeholder={t('filterByProfessional')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allProfessionals')}</SelectItem>
            {professionals.map(professional => (
              <SelectItem key={professional.id} value={professional.id}>
                {professional.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className='bg-blue-500 text-white hover:bg-blue-600'
          onClick={handleCreateMission}
        >
          <Plus className='mr-2 h-4 w-4' />
          {t('createMission')}
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
        </div>
      )}

      {/* Mission Details Dialog */}
      <MissionDetailsDialog
        isLoading={isLoadingMission}
        mission={selectedMission ?? null}
        onClose={handleCloseDialog}
        open={isDialogOpen}
      />
    </div>
  );
}
