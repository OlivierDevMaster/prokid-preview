import { Building2, MessageSquare, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { StatCard } from '@/components/admin/stat-card';

export default async function DashboardPage() {
  const t = await getTranslations('admin.dashboard');

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <StatCard icon={Building2} title={t('totalAffaires')} value='3' />
        <StatCard icon={Users} title={t('totalAcheteurs')} value='522' />
        <StatCard
          icon={MessageSquare}
          title={t('correspondancesPotentielles')}
          value='1566'
        />
      </div>
    </div>
  );
}
