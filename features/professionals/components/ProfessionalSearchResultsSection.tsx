'use client';

import { FunnelX, Search, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/features/paginations/components/Pagination';
import { ProfessionalSearchCard } from '@/features/professionals/components/ProfessionalSearchCard';
import { Professional } from '@/features/professionals/professional.model';

interface ProfessionalSearchResultsSectionProps {
  hasResults: boolean;
  isSelected: (professionalId: string) => boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onResetFilters: () => void;
  onToggleSelect: (professionalId: string) => void;
  page: number;
  pageSize: number;
  professionals: Professional[];
  resultsCount: number;
  totalCount: number;
  totalPages: number;
}

export function ProfessionalSearchResultsSection({
  hasResults,
  isSelected,
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
          <div className='relative flex items-center justify-center'>
            {/* Icône utilisateur au centre */}
            <User className='size-16 fill-gray-300 stroke-none' />
            {/* Icône loupe en bas à droite */}
            <span className='absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-slate-100 shadow-sm'>
              <Search className='size-6 text-gray-300' strokeWidth={3} />
            </span>
          </div>
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
      <div className='mx-4 mb-2 sm:mb-4'>
        <h2 className='text-xl font-semibold text-gray-800'>
          <span className='font-semibold'>{resultsCount}</span>{' '}
          {resultsCount === 1 ? t('results.foundOne') : t('results.found')}
        </h2>
        <p className='text-sm text-gray-400'>{t('results.foundDescription')}</p>
      </div>
      <div className='mx-4 mt-4 grid max-w-7xl grid-cols-1 gap-4 sm:mt-6 md:grid-cols-2 xl:grid-cols-3'>
        {professionals.map(professional => (
          <ProfessionalSearchCard
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
