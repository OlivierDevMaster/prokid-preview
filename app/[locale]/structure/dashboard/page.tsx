import { MessageSquare, UserPlus, Users } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { getTranslations } from 'next-intl/server';

import { StatCard } from '@/features/admin/StatCard';
import { findStructureInvitations } from '@/features/structure-invitations/structureInvitation.service';
import { getProfessionalsForStructure } from '@/features/structure-members/structureMember.service';
import { getStructureMissions } from '@/features/structure/missions/services/mission.service';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const t = await getTranslations('structure.dashboard');
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className='h-full space-y-8 bg-blue-50/30 p-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
          <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
        </div>
        <p className='text-gray-600'>{t('notAuthenticated')}</p>
      </div>
    );
  }

  // Fetch counts for professionals, missions, and invitations
  const [professionalsResult, missionsResult, invitationsResult] =
    await Promise.all([
      getProfessionalsForStructure(userId, {}, { limit: 1, page: 1 }),
      getStructureMissions(userId, {}, { limit: 1, page: 1 }),
      findStructureInvitations({ structure_id: userId }, { limit: 1, page: 1 }),
    ]);

  const professionalsCount = professionalsResult.count ?? 0;
  const missionsCount = missionsResult.count ?? 0;
  const invitationsCount = invitationsResult.count ?? 0;

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
          icon={Users}
          title={t('totalProfessionals')}
          value={professionalsCount.toString()}
        />
        <StatCard
          icon={MessageSquare}
          title={t('totalMissions')}
          value={missionsCount.toString()}
        />
        <StatCard
          icon={UserPlus}
          title={t('totalInvitations')}
          value={invitationsCount.toString()}
        />
      </div>
    </div>
  );
}
