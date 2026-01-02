'use client';

import {
  Building2,
  CheckCircle,
  Clock,
  MessageSquare,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useGetDashboardStats } from '@/features/admin/hooks/useGetDashboardStats';
import { StatCard } from '@/features/admin/StatCard';

export default function DashboardPage() {
  const t = useTranslations('admin.dashboard');

  const {
    activeMissionsCount,
    activeProfessionalsCount,
    activeStructuresCount,
    missionsCount,
    pendingInvitationsCount,
    pendingMissionsCount,
    professionalsCount,
    structuresCount,
  } = useGetDashboardStats();

  return (
    <div className='min-h-screen space-y-4 overflow-hidden bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          {t('title')}
        </h1>
        <p className='mt-2 text-sm text-gray-600 sm:text-base'>
          {t('subtitle')}
        </p>
      </div>

      {/* Stats Cards - Main KPIs */}
      <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3'>
        <StatCard
          icon={Users}
          title={t('totalProfessionals')}
          value={professionalsCount.toString()}
        />
        <StatCard
          icon={Building2}
          title={t('totalStructures')}
          value={structuresCount.toString()}
        />
        <StatCard
          icon={MessageSquare}
          title={t('totalMissions')}
          value={missionsCount.toString()}
        />
      </div>

      {/* User Status */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('userStatus')}
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
          <StatCard
            description={t('activeProfessionalsDescription')}
            icon={UserCheck}
            subtitle={
              professionalsCount > 0
                ? `${activeProfessionalsCount}/${professionalsCount} (${Math.round((activeProfessionalsCount / professionalsCount) * 100)}%)`
                : undefined
            }
            title={t('activeProfessionals')}
            value={activeProfessionalsCount.toString()}
          />
          <StatCard
            description={t('activeStructuresDescription')}
            icon={Building2}
            subtitle={
              structuresCount > 0
                ? `${activeStructuresCount}/${structuresCount} (${Math.round((activeStructuresCount / structuresCount) * 100)}%)`
                : undefined
            }
            title={t('activeStructures')}
            value={activeStructuresCount.toString()}
          />
        </div>
      </div>

      {/* Mission Status */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('missionStatus')}
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
          <StatCard
            icon={Clock}
            title={t('pendingMissions')}
            value={pendingMissionsCount.toString()}
          />
          <StatCard
            icon={CheckCircle}
            title={t('activeMissions')}
            value={activeMissionsCount.toString()}
          />
        </div>
      </div>

      {/* Invitations */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('invitations')}
        </h2>
        <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-1'>
          <StatCard
            icon={UserPlus}
            title={t('pendingInvitations')}
            value={pendingInvitationsCount.toString()}
          />
        </div>
      </div>
    </div>
  );
}
