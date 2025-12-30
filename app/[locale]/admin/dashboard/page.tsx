import { Building2, MessageSquare, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { StatCard } from '@/features/admin/StatCard';
import { getMissionsCount } from '@/features/missions/mission.service';
import { getProfessionals } from '@/features/professionals/professional.service';
import { getStructures } from '@/features/structures/structure.service';

export default async function DashboardPage() {
  const t = await getTranslations('admin.dashboard');

  // Fetch counts for professionals, structures, and missions
  const [professionalsResult, structuresResult, missionsResult] =
    await Promise.all([
      getProfessionals({}, { limit: 1, page: 1 }),
      getStructures({}, { limit: 1, page: 1 }),
      getMissionsCount(),
    ]);

  const professionalsCount = professionalsResult.count ?? 0;
  const structuresCount = structuresResult.count ?? 0;
  const missionsCount = missionsResult;

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

      {/* Stats Cards */}
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
    </div>
  );
}
