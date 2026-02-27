'use client';

import { ArrowLeft, Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MissionStatus,
  MissionStatusLabel,
} from '@/features/missions/mission.model';
import { useGetProfessionals } from '@/features/structure/professionals/hooks/useGetProfessionals';
import { useRouter } from '@/i18n/routing';

import { useGetMission } from '../hooks/useGetMission';
import { useGetMissions } from '../hooks/useGetMissions';
import { MissionCard } from './MissionCard';
import { MissionDetailsDialog } from './MissionDetailsDialog';

export function MissionsPage() {
  const t = useTranslations('structure.missions');
  const router = useRouter();
  const locale = (useLocale() as 'en' | 'fr') || 'en';
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    'all' | string
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | MissionStatus>(
    'all'
  );
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
    ...(selectedStatus && selectedStatus !== 'all'
      ? { status: selectedStatus }
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

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as 'all' | MissionStatus);
  };

  const handleBackToDashboard = () => {
    router.push('/structure/dashboard');
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
          <div className='flex items-center gap-3'>
          <Button
              aria-label={t('backToDashboard')}
              className='h-8 w-8'
              onClick={handleBackToDashboard}
              variant='ghost'
            >
              <ArrowLeft className='h-8 w-8' />
            </Button>
            <h1 className='text-3xl font-bold text-gray-800'>{t('title')}</h1>

          </div>
          <p className='mt-2 text-gray-600'>{t('description')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-4 md:flex-row md:justify-between'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <Select
            onValueChange={handleProfessionalChange}
            value={selectedProfessionalId}
          >
            <SelectTrigger className='w-full sm:w-[250px]'>
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
          <Select onValueChange={handleStatusChange} value={selectedStatus}>
            <SelectTrigger className='w-full sm:w-[250px]'>
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('allStatuses')}</SelectItem>
              {Object.values(MissionStatus).map(status => (
                <SelectItem key={status} value={status}>
                  {MissionStatusLabel[locale][status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className='w-full bg-blue-500 text-white hover:bg-blue-600 sm:w-auto md:w-auto'
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
