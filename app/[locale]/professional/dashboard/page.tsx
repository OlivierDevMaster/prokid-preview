'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useGetProfessionalMissions } from '@/features/missions/hooks/useGetProfessionalMissions';
import { AvailabilityStatusPopover } from '@/features/professional/Availabilities/components/AvailabilityStatusPopover';
import { ProfessionalMissionCard } from '@/features/professional/missions/components/ProfessionalMissionCard';
import { ProfessionalMissionDetailsDialog } from '@/features/professional/missions/components/ProfessionalMissionDetailsDialog';
import { useGetProfessionalMission } from '@/features/professional/missions/hooks/useGetProfessionalMission';
import { ProfessionalReportCard } from '@/features/professional/reports/components/ProfessionalReportCard';
import { useReports } from '@/features/professional/reports/hooks/useReports';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { Link } from '@/i18n/routing';

export default function DashboardPage() {
  const t = useTranslations('professional.dashboard');
  const { data: session } = useSession();
  const { data: professional } = useFindProfessional(session?.user?.id);

  // Get user's first name from professional profile
  const firstName =
    professional?.profile?.first_name || session?.user?.name || '';

  // Mock values for UI only
  const availabilityDaysCount = 30;
  const unreadCount = 2;

  // Get missions for dashboard (limit to 2)
  const { data: missionsData, isLoading: isLoadingMissions } =
    useGetProfessionalMissions({}, { limit: 2, page: 1 });

  const missions = missionsData?.data ?? [];

  // Get reports for dashboard (limit to 2)
  const { data: reportsData, isLoading: isLoadingReports } = useReports();
  const reports = (reportsData ?? []).slice(0, 2);

  // Dialog state
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
    <div className='min-h-screen bg-blue-50/30 p-4 sm:p-6 lg:p-8'>
      {/* Header with greeting and status */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {t('greeting', { name: firstName })}
          </h1>
          <div className='mt-1 flex items-center gap-2 text-sm text-gray-600'>
            <span>{t('availabilityDaysShort')}</span>
            <span className='text-blue-600'>
              {availabilityDaysCount} {t('daysLabel')}
            </span>
            <span className='text-gray-400'>·</span>
            <span className='text-blue-600'>
              {t('unreadNotifications', { count: unreadCount })}
            </span>
          </div>
        </div>

        {/* Availability Status Popover */}
        <AvailabilityStatusPopover />
      </div>

      {/* Missions Section */}
      <div className='mb-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>
            {t('missions')}
          </h2>
          <Link
            className='text-sm font-medium text-blue-600 hover:underline'
            href='/professional/missions'
          >
            {t('viewAll')}
          </Link>
        </div>
        {isLoadingMissions ? (
          <p className='text-sm text-gray-600'>{t('loading')}</p>
        ) : missions.length > 0 ? (
          <div className='space-y-3'>
            {missions.map(mission => (
              <ProfessionalMissionCard
                key={mission.id}
                mission={mission}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <p className='text-sm text-gray-600'>{t('noMissions')}</p>
        )}
      </div>

      {/* Reports Section */}
      <div className='mb-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>
            {t('reports')}
          </h2>
          <Link
            className='text-sm font-medium text-blue-600 hover:underline'
            href='/professional/reports'
          >
            {t('viewAll')}
          </Link>
        </div>
        {isLoadingReports ? (
          <p className='text-sm text-gray-600'>{t('loading')}</p>
        ) : reports.length > 0 ? (
          <div className='space-y-3'>
            {reports.map(report => (
              <ProfessionalReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <p className='text-sm text-gray-600'>{t('noReports')}</p>
        )}
      </div>

      {/* Mission Details Dialog */}
      <ProfessionalMissionDetailsDialog
        isLoading={isLoadingMission}
        mission={selectedMission ?? null}
        onClose={handleCloseDialog}
        open={isDialogOpen}
      />
    </div>
  );
}
