'use client';
import { Building2, ClipboardList, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { StatCard } from '@/features/admin/StatCard';
import { useGetDashboardStats } from '@/features/professional/hooks/useGetDashboardStats';

export default function DashboardPage() {
  const t = useTranslations('professional.dashboard');

  const { missionsCount, reportsCount, structuresCount } =
    useGetDashboardStats();

  return (
    <div className='h-full space-y-8 bg-blue-50/30 p-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
      </div>

      {/* Stats Cards */}
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
    </div>
  );
}
