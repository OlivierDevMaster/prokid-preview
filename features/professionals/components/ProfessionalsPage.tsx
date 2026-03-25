'use client';

import { useTranslations } from 'next-intl';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useMemo } from 'react';

import { Pagination } from '@/features/paginations/components/Pagination';
import { ProfessionalFiltersSection } from '@/features/professionals/components/ProfessionalFiltersSection';
import { ProfessionalsCard } from '@/features/professionals/components/ProfessionalsCard';
import { ProfessionalConfig } from '@/features/professionals/professional.config';
import { Professional } from '@/features/professionals/professional.model';

import { useFindProfessionals } from '../hooks/useFindProfessionals';
import { useProfessionalSearch } from '../hooks/useProfessionalSearch';

export default function ProfessionalsPage() {
  const t = useTranslations('professional');
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
  const hasResults = totalCount > 0;

  return (
    <main className='min-h-screen bg-[#f5f7f5] px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 sm:mb-8'>
          <h1 className='mb-2 text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl'>
            {t('title')}
          </h1>
          <p className='text-base text-gray-600 sm:text-lg'>{t('subtitle')}</p>
        </div>

        <ProfessionalFiltersSection
          actions={actions}
          hasResults={hasResults}
          resultsCount={resultsCount}
          state={state}
        />

        <div className='mb-4 sm:mb-6'>
          <p className='text-sm text-gray-700 sm:text-base'>
            <span className='font-semibold'>{resultsCount}</span>{' '}
            {resultsCount === 1 ? t('results.foundOne') : t('results.found')}
          </p>
        </div>

        <div className='space-y-3 sm:space-y-4'>
          {professionals.map((professional: Professional) => (
            <ProfessionalsCard
              key={professional.user_id}
              professional={professional}
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
