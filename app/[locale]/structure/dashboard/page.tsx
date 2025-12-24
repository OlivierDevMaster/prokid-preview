'use client';
import { MessageSquare, UserPlus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { StatCard } from '@/features/admin/StatCard';
import { useGetDashboardStats } from '@/features/structure/hooks/useGetDashboardStats';

export default function DashboardPage() {
  const t = useTranslations('structure.dashboard');

  const { missionsCount, professionalsCount } = useGetDashboardStats();

  return (
    <div className='min-h-screen space-y-8 bg-blue-50/30 p-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <StatCard
          icon={Users}
          title={t('totalProfessionals')}
          value={professionalsCount.toString()}
        />
        <StatCard
          icon={MessageSquare}
          title={t('totalMissions')}
          value={missionsCount.toString()}
        />
        <StatCard icon={UserPlus} title={t('totalInvitations')} value={'0'} />
      </div>
    </div>
  );
}
