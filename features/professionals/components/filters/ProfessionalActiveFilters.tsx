'use client';

import { ChevronDown, Funnel, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfessionalActiveFiltersProps {
  collapsibleOnMobile?: boolean;
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
  collapsibleOnMobile = false,
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
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const availabilityLabel =
    selectedAvailability === 'available'
      ? t('availability.available')
      : t(`availability.${selectedAvailability}`);

  const hasFilters =
    searchQuery ||
    locationQuery ||
    selectedRole !== 'all' ||
    selectedAvailability !== 'all';

  const chipCount =
    (searchQuery ? 1 : 0) +
    (locationQuery ? 1 : 0) +
    (selectedRole !== 'all' ? 1 : 0) +
    (selectedAvailability !== 'all' ? 1 : 0);

  if (!hasFilters) {
    return null;
  }

  const chips = (
    <>
      {searchQuery && (
        <Badge
          className='flex min-h-9 items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
          variant='outline'
        >
          <span className='max-w-[150px] truncate sm:max-w-none'>
            {t('search.placeholder')}: {searchQuery}
          </span>
          <button
            className='ml-1 flex min-h-8 min-w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-blue-300'
            onClick={onClearSearch}
            type='button'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}

      {locationQuery && (
        <Badge
          className='flex min-h-9 items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
          variant='outline'
        >
          <span className='max-w-[150px] truncate sm:max-w-none'>
            {t('search.locationPlaceholder')}: {locationQuery}
          </span>
          <button
            className='ml-1 flex min-h-8 min-w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-blue-300'
            onClick={onClearLocation}
            type='button'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}

      {selectedRole !== 'all' && (
        <Badge
          className='flex min-h-9 items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
          variant='outline'
        >
          <span className='max-w-[150px] truncate sm:max-w-none'>
            {t('search.role')}: {t(`jobs.${selectedRole}`)}
          </span>
          <button
            className='ml-1 flex min-h-8 min-w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-blue-300'
            onClick={onClearRole}
            type='button'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}

      {selectedAvailability !== 'all' && (
        <Badge
          className='flex min-h-9 items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
          variant='outline'
        >
          <span className='max-w-[150px] truncate sm:max-w-none'>
            {t('search.availability')}: {availabilityLabel}
          </span>
          <button
            className='ml-1 flex min-h-8 min-w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-blue-300'
            onClick={onClearAvailability}
            type='button'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      )}
    </>
  );

  return (
    <div className='mt-4'>
      {collapsibleOnMobile && (
        <button
          aria-expanded={mobileExpanded}
          className='mb-2 flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-left text-sm font-semibold text-slate-800 shadow-sm md:hidden'
          onClick={() => setMobileExpanded(v => !v)}
          type='button'
        >
          <span className='flex items-center gap-2'>
            <Funnel className='h-4 w-4 text-slate-500' />
            {t('search.activeFiltersToggle', { count: chipCount })}
          </span>
          <ChevronDown
            className={cn(
              'h-5 w-5 flex-shrink-0 text-slate-500 transition-transform',
              mobileExpanded && 'rotate-180'
            )}
          />
        </button>
      )}

      <div
        className={cn(
          'flex flex-wrap items-center gap-2',
          collapsibleOnMobile && !mobileExpanded && 'max-md:hidden'
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2 text-xs text-slate-500 sm:text-sm',
            collapsibleOnMobile && 'hidden md:flex'
          )}
        >
          <Funnel className='h-3 w-3 sm:h-4 sm:w-4' />
          <span>{t('search.activeFilters')}</span>
        </div>

        {chips}

        {hasResults && (
          <Button
            className='ml-auto h-8 px-0 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline sm:h-7'
            onClick={onClearAll}
            size='sm'
            variant='link'
          >
            {t('search.reset')}
          </Button>
        )}
      </div>
    </div>
  );
}
