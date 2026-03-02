'use client';

import { useTranslations } from 'next-intl';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';

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
  const { selectedProfessionalIds, setSelectedProfessionalIds, handleToggleProfessional, handleClearSelection } = useSelectedProfessional();
  const t = useTranslations('professional');
  const tCommon = useTranslations('common.actions');
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
    <main className='min-h-screen bg-[#f5f7f5] px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 sm:mb-8'>
          <h1 className='mb-2 text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl'>
            {t('title')}
          </h1>
          <p className='text-base text-gray-600 sm:text-lg'>{t('subtitle')}</p>
        </div>

        <ProfessionalFiltersSection actions={actions} state={state} />

        <div className='mb-4 sm:mb-6'>
          <p className='text-sm text-gray-700 sm:text-base'>
            <span className='font-semibold'>{resultsCount}</span>{' '}
            {resultsCount === 1 ? t('results.foundOne') : t('results.found')}
          </p>
        </div>

        <div className='mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3'>
          <p className='text-sm font-medium text-blue-700 sm:text-base'>
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
          <div className='flex gap-3'>
            <Button
              className='text-blue-600 hover:bg-blue-100 hover:text-blue-700'
              onClick={handleClearSelection}
              variant='ghost'
            >
              {tCommon('cancel')}
            </Button>
            <Button
              className='bg-blue-500 text-white hover:bg-blue-600'
              disabled={selectedProfessionalIds.size === 0}
              onClick={handleSendMission}
            >
              {tMissions('sendMission')}
            </Button>
          </div>
        </div>



        <div className='space-y-3 sm:space-y-4 mt-4'>
          {professionals.map((professional: Professional) => (
            <ProfessionalSearchCard
              key={professional.user_id}
              onToggleSelect={(professional) => handleToggleProfessional(professional.user_id)}
              professional={professional}
              selectable
              selected={selectedProfessionalIds.has(professional.user_id)}
            />
          ))}
        </div>



        {totalCount > 0 && (
          <div className='mt-8'>
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
      </div>
    </main>
  );
}
