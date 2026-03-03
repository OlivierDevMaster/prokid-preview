'use client';

import { useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { StructureDashboardMissionsSection } from '@/features/structure/dashboard/StructureDashboardMissionsSection';
import { StructureDashboardReportsSection } from '@/features/structure/dashboard/StructureDashboardReportsSection';
import { useGetMissions } from '@/features/structure/missions/hooks/useGetMissions';
import { useFindStructure } from '@/features/structures/hooks/useFindStructure';
import { Link } from '@/i18n/routing';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

export default function DashboardPage() {
  const t = useTranslations('structure.dashboard');
  const { data: session } = useSession();
  const { handleClearSelection } = useSelectedProfessional();
  const { data: structure } = useFindStructure(session?.user?.id);

  const { data: missionsData } = useGetMissions({}, { limit: 1, page: 1 });
  const missionsCount = missionsData?.count ?? 0;

  const structureName = structure?.name || t('structureNameFallback');

  useEffect(() => {
    handleClearSelection();
  }, [handleClearSelection]);

  return (
    <div className='min-h-screen space-y-8 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>
            {structureName}
          </h1>
          <div className='mt-1 text-xs text-gray-500'>
            <span className='font-medium text-gray-700'>
              {t('missionsCount', { count: missionsCount })}
            </span>
            <span className='mx-1'>·</span>
            <span className='text-blue-600'>{t('messagesPlaceholder')}</span>
          </div>
        </div>
        <Link href='/structure/search'>
          <Button className='gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700'>
            <Search className='h-4 w-4' />
            {t('findProCta')}
          </Button>
        </Link>
      </div>

      <StructureDashboardMissionsSection />
      <StructureDashboardReportsSection />
    </div>
  );
}
