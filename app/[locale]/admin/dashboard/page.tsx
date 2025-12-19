import { Building2, MessageSquare, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { StatCard } from '@/features/admin/StatCard';
import { findMissions } from '@/features/missions/mission.service';
import { getProfessionals } from '@/features/professionals/professional.service';
import { getStructures } from '@/features/structures/structure.service';

export default async function DashboardPage() {
  const t = await getTranslations('admin.dashboard');

  // Fetch counts for professionals, structures, and missions
  const [professionalsResult, structuresResult, missionsResult] =
    await Promise.all([
      getProfessionals({}, { limit: 1, page: 1 }),
      getStructures({}, { limit: 1, page: 1 }),
      findMissions({}, { limit: 1, page: 1 }),
    ]);

  const professionalsCount = professionalsResult.count ?? 0;
  const structuresCount = structuresResult.count ?? 0;
  const missionsCount = missionsResult.count ?? 0;

  return (
    <div className='min-h-screen space-y-8 overflow-hidden bg-blue-50/30 p-8'>
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
    </div>
  );
}
