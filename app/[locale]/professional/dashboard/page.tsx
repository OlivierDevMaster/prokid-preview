'use client';
import {
  Building2,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  FileCheck,
  FileText,
  MessageSquare,
  Percent,
  Send,
  UserPlus,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { StatCard } from '@/features/admin/StatCard';
import { useGetDashboardStats } from '@/features/professional/hooks/useGetDashboardStats';

export default function DashboardPage() {
  const t = useTranslations('professional.dashboard');

  const {
    acceptedMissionsCount,
    activeAvailabilitiesCount,
    completedMissionsCount,
    draftReportsCount,
    missionsCount,
    pendingInvitationsCount,
    pendingMissionsCount,
    reportsCount,
    responseRate,
    sentReportsCount,
    structuresCount,
    upcomingMissionsCount,
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
          icon={Building2}
          title={t('totalStructures')}
          value={structuresCount.toString()}
        />
        <StatCard
          icon={MessageSquare}
          title={t('totalMissions')}
          value={missionsCount.toString()}
        />
        <StatCard
          icon={ClipboardList}
          title={t('totalReports')}
          value={reportsCount.toString()}
        />
      </div>

      {/* High Priority Additional KPIs */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('missionStatus')}
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <StatCard
            icon={Clock}
            title={t('pendingMissions')}
            value={pendingMissionsCount.toString()}
          />
          <StatCard
            icon={FileCheck}
            title={t('acceptedMissions')}
            value={acceptedMissionsCount.toString()}
          />
          <StatCard
            icon={MessageSquare}
            title={t('upcomingMissions')}
            value={upcomingMissionsCount.toString()}
          />
        </div>
      </div>

      {/* Reports Status */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('reportStatus')}
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <StatCard
            icon={FileText}
            title={t('draftReports')}
            value={draftReportsCount.toString()}
          />
          <StatCard
            icon={Send}
            title={t('sentReports')}
            value={sentReportsCount.toString()}
          />
        </div>
      </div>

      {/* Medium Priority Additional KPIs */}
      <div>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          {t('additionalMetrics')}
        </h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            icon={CheckCircle}
            title={t('completedMissions')}
            value={completedMissionsCount.toString()}
          />
          <StatCard
            icon={Calendar}
            title={t('activeAvailabilities')}
            value={activeAvailabilitiesCount.toString()}
          />
          <StatCard
            icon={Percent}
            subtitle={t('responseRateDescription')}
            title={t('responseRate')}
            value={`${responseRate}%`}
          />
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
