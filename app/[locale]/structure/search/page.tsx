'use client';

import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/features/paginations/components/Pagination';
import { ProfessionalFiltersSection } from '@/features/professionals/components/ProfessionalFiltersSection';
import { ProfessionalSearchCard } from '@/features/professionals/components/ProfessionalSearchCard';
import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';
import { useProfessionalSearch } from '@/features/professionals/hooks/useProfessionalSearch';
import { ProfessionalConfig } from '@/features/professionals/professional.config';
import { Professional } from '@/features/professionals/professional.model';
import { useRouter } from '@/i18n/routing';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

export default function StructureSearchPage() {
  const { handleToggleProfessional, selectedProfessionalIds } =
    useSelectedProfessional();
  const t = useTranslations('professional');
  const tMissions = useTranslations('structure.missions');
  const router = useRouter();
  const { actions, state } = useProfessionalSearch();

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(ProfessionalConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(ProfessionalConfig.PAGE_SIZE_DEFAULT)
  );

  const { data } = useFindProfessionals(
    {
      availability: state.selectedAvailability,
      current_job:
        state.selectedRole === 'all' ? undefined : state.selectedRole,
      locationSearch: state.locationQuery,
      search: state.searchQuery,
    },
    { limit: pageSize, page }
  );

  const professionals: Professional[] = useMemo(() => data?.data ?? [], [data]);
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const resultsCount = totalCount;

  const handleSendMission = () => {
    if (selectedProfessionalIds.size === 0) {
      return;
    }
    const professionalIds = Array.from(selectedProfessionalIds);
    router.push(
      `/structure/missions/new?professional_ids=${professionalIds.join(',')}`
    );
  };

  return (
    <main className='min-h-screen bg-gray-100 pb-4'>
      <div className='mx-auto max-w-7xl space-y-4 sm:space-y-6'>
        <ProfessionalFiltersSection actions={actions} state={state} />
        <div className='mx-4 mb-2 sm:mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>
            <span className='font-semibold'>{resultsCount}</span>{' '}
            {resultsCount === 1 ? t('results.foundOne') : t('results.found')}
          </h2>
          <p className='text-sm text-gray-400'>
            {t('results.foundDescription')}
          </p>
        </div>
        <div className='mx-4 mt-4 grid max-w-7xl grid-cols-1 gap-4 sm:mt-6 md:grid-cols-2 xl:grid-cols-3'>
          {professionals.map((professional: Professional) => (
            <ProfessionalSearchCard
              key={professional.user_id}
              onToggleSelect={professional =>
                handleToggleProfessional(professional.user_id)
              }
              professional={professional}
              selectable
              selected={selectedProfessionalIds.has(professional.user_id)}
            />
          ))}
        </div>
        {totalCount > 0 && (
          <div className='mt-8 flex justify-center'>
            <Pagination
              currentPage={page}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSize={pageSize}
              totalItems={totalCount}
              totalPages={totalPages}
            />
          </div>
        )}

        <div className='flex justify-end p-4'>
          <div className='flex items-center gap-6 rounded-2xl border border-gray-200 px-4 py-4'>
            <p className='text-xs font-medium sm:text-base'>
              {selectedProfessionalIds.size === 0 ? (
                tMissions('noneSelected')
              ) : (
                <>
                  {selectedProfessionalIds.size}{' '}
                  {selectedProfessionalIds.size === 1
                    ? tMissions('selected')
                    : tMissions('selectedPlural')}
                </>
              )}
            </p>
            <div className='flex gap-3 px-4 py-2'>
              <Button
                className='flex items-center gap-3 rounded-full px-6 py-6 text-sm font-semibold text-white shadow-md hover:bg-blue-700 sm:text-base'
                disabled={selectedProfessionalIds.size === 0}
                onClick={handleSendMission}
              >
                <Send className='h-4 w-4' />
                <span>{tMissions('sendMission')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
