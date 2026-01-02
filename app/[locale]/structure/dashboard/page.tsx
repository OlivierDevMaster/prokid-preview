'use client';
import {
  CheckCircle,
  Clock,
  FileCheck,
  MessageSquare,
  UserPlus,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { StatCard } from '@/features/admin/StatCard';
import { useGetDashboardStats } from '@/features/structure/hooks/useGetDashboardStats';

export default function DashboardPage() {
  const t = useTranslations('structure.dashboard');

  const {
    activeMembersCount,
    activeMissionsCount,
    missionsCount,
    pendingInvitationsCount,
    pendingMissionsCount,
    receivedReportsCount,
  } = useGetDashboardStats();

  return (
    <div className='min-h-screen space-y-8 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:p-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
      </div>

      {/* Stats Cards - Main KPIs */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <StatCard
          icon={Users}
          title={t('totalProfessionals')}
          value={activeMembersCount.toString()}
        />
        <StatCard
          icon={MessageSquare}
          title={t('totalMissions')}
          value={missionsCount.toString()}
        />
        <StatCard
          icon={UserPlus}
          title={t('totalInvitations')}
          value={pendingInvitationsCount.toString()}
        />
      </div>

      {/* High Priority Additional KPIs */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('missionStatus')}
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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

      {/* Reports Status */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('reportStatus')}
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-1'>
          <StatCard
            icon={FileCheck}
            title={t('receivedReports')}
            value={receivedReportsCount.toString()}
          />
        </div>
      </div>
    </div>
  );
}
