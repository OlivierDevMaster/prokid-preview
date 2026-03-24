'use client';

import { Funnel, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfessionalActiveFiltersProps {
  hasResults: boolean;
  locationQuery: string;
  onClearAll: () => void;
  onClearAvailability: () => void;
  onClearLocation: () => void;
  onClearRole: () => void;
  onClearSearch: () => void;
  searchQuery: string;
  selectedAvailability: string;
  selectedRole: string;
}

export function ProfessionalActiveFilters({
  hasResults,
  locationQuery,
  onClearAll,
  onClearAvailability,
  onClearLocation,
  onClearRole,
  onClearSearch,
  searchQuery,
  selectedAvailability,
  selectedRole,
}: ProfessionalActiveFiltersProps) {
  const t = useTranslations('professional');
  const availabilityLabel =
    selectedAvailability === 'available'
      ? t('availability.available')
      : t(`availability.${selectedAvailability}`);

  const hasFilters =
    searchQuery ||
    locationQuery ||
    selectedRole !== 'all' ||
    selectedAvailability !== 'all';

  if (!hasFilters) {
    return null;
  }

  return (
    <div className='mt-4 flex flex-wrap items-center gap-2'>
      <div className='flex items-center gap-2 text-xs text-slate-500 sm:text-sm'>
        <Funnel className='h-3 w-3 sm:h-4 sm:w-4' />
        <span>{t('search.activeFilters')}</span>
      </div>

      {searchQuery && (
        <Badge
          className='flex items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
          variant='outline'
        >
          <span className='max-w-[150px] truncate sm:max-w-none'>
            {t('search.placeholder')}: {searchQuery}
          </span>
          <button
            className='ml-1 flex-shrink-0 rounded-full hover:bg-blue-300'
            onClick={onClearSearch}
            type='button'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}

      {locationQuery && (
        <Badge
          className='flex items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
          variant='outline'
        >
          <span className='max-w-[150px] truncate sm:max-w-none'>
            {t('search.locationPlaceholder')}: {locationQuery}
          </span>
          <button
            className='ml-1 flex-shrink-0 rounded-full hover:bg-blue-300'
            onClick={onClearLocation}
            type='button'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}

      {selectedRole !== 'all' && (
        <Badge
          className='flex items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
          variant='outline'
        >
          <span className='max-w-[150px] truncate sm:max-w-none'>
            {t('search.role')}: {t(`jobs.${selectedRole}`)}
          </span>
          <button
            className='ml-1 flex-shrink-0 rounded-full hover:bg-blue-300'
            onClick={onClearRole}
            type='button'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}

      {selectedAvailability !== 'all' && (
        <Badge
          className='flex items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
          variant='outline'
        >
          <span className='max-w-[150px] truncate sm:max-w-none'>
            {t('search.availability')}: {availabilityLabel}
          </span>
          <button
            className='ml-1 flex-shrink-0 rounded-full hover:bg-blue-300'
            onClick={onClearAvailability}
            type='button'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}

      {hasResults && (
        <Button
          className='ml-auto h-7 px-0 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline'
          onClick={onClearAll}
          size='sm'
          variant='link'
        >
          {t('search.reset')}
        </Button>
      )}
    </div>
  );
}
