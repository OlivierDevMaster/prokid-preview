'use client';

import { FunnelX, UserSearch } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/features/paginations/components/Pagination';
import { ProfessionalSearchCard } from '@/features/professionals/components/ProfessionalSearchCard';
import { ProfessionalWithDistance } from '@/features/professionals/types/nearby-professionals.types';

interface ProfessionalSearchResultsSectionProps {
  hasResults: boolean;
  isSelected: (professionalId: string) => boolean;
  locationFallback?: boolean;
  locationQuery?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onResetFilters: () => void;
  onToggleSelect: (professionalId: string) => void;
  page: number;
  pageSize: number;
  professionals: ProfessionalWithDistance[];
  resultsCount: number;
  totalCount: number;
  totalPages: number;
}

export function ProfessionalSearchResultsSection({
  hasResults,
  isSelected,
  locationFallback,
  locationQuery,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
  onToggleSelect,
  page,
  pageSize,
  professionals,
  resultsCount,
  totalCount,
  totalPages,
}: ProfessionalSearchResultsSectionProps) {
  const t = useTranslations('professional');

  if (!hasResults) {
    return (
      <div className='mx-4 mt-8 flex flex-col items-center justify-center rounded-3xl px-4 py-16 text-center shadow-sm sm:mt-10 sm:px-8 sm:py-20'>
        <div className='mb-6 flex size-32 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-slate-100'>
          <UserSearch className='size-16 text-gray-300' />
        </div>
        <h2 className='mb-2 text-xl font-semibold text-slate-900 sm:text-2xl'>
          {t('results.emptyTitle')}
        </h2>
        <p className='mb-8 max-w-xl text-sm text-slate-500 sm:text-base'>
          {t('results.emptyDescription')}
        </p>
        <Button
          className='flex items-center justify-center gap-2 rounded-2xl px-6 py-5 text-sm font-semibold text-white'
          onClick={onResetFilters}
          type='button'
        >
          <FunnelX className='size-8' />
          <span>{t('results.emptyResetButton')}</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className='mx-4 mb-2 mt-6 sm:mb-4 sm:mt-8'>
        {locationFallback && locationQuery ? (
          <>
            <div className='mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3'>
              <p className='text-sm font-medium text-amber-800'>
                Aucun professionnel trouvé à <strong>{locationQuery}</strong>. Voici les professionnels les plus proches de votre structure.
              </p>
            </div>
            <h2 className='text-xl font-semibold text-gray-800'>
              <span className='font-semibold'>{resultsCount}</span>{' '}
              {resultsCount === 1 ? t('results.foundOne') : t('results.found')}
            </h2>
          </>
        ) : (
          <>
            <h2 className='text-xl font-semibold text-gray-800'>
              <span className='font-semibold'>{resultsCount}</span>{' '}
              {resultsCount === 1 ? t('results.foundOne') : t('results.found')}
            </h2>
            <p className='text-sm text-gray-400'>{t('results.foundDescription')}</p>
          </>
        )}
      </div>
      <div className='mx-4 mt-4 grid max-w-7xl grid-cols-1 gap-4 sm:mt-6 md:grid-cols-2 xl:grid-cols-3'>
        {professionals.map(professional => (
          <ProfessionalSearchCard
            distanceKm={professional.distance_km}
            isDefaultCase={professional.is_default_case}
            key={professional.user_id}
            onToggleSelect={() => onToggleSelect(professional.user_id)}
            professional={professional}
            selectable
            selected={isSelected(professional.user_id)}
          />
        ))}
      </div>
      <div className='mt-8 flex justify-center'>
        <Pagination
          currentPage={page}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSize={pageSize}
          totalItems={totalCount}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}
