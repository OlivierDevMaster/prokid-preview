'use client';

import { addDays, format, parseISO } from 'date-fns';
import { X } from 'lucide-react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { ProfessionalActiveFilters } from '@/features/professionals/components/filters/ProfessionalActiveFilters';
import { ProfessionalAvailabilitySelect } from '@/features/professionals/components/filters/ProfessionalAvailabilitySelect';
import { ProfessionalLocationInput } from '@/features/professionals/components/filters/ProfessionalLocationInput';
import { ProfessionalRoleSelect } from '@/features/professionals/components/filters/ProfessionalRoleSelect';
import { ProfessionalSearchInput } from '@/features/professionals/components/filters/ProfessionalSearchInput';
import { StructureLocationActivation } from '@/features/professionals/components/filters/StructureLocationActivation';

import {
  ProfessionalSearchActions,
  ProfessionalSearchState,
} from '../hooks/useProfessionalSearch';

interface ProfessionalFiltersSectionProps {
  actions: ProfessionalSearchActions;
  hasResults: boolean;
  showStructureLocationActivation?: boolean;
  state: ProfessionalSearchState;
}

export function ProfessionalFiltersSection({
  actions,
  hasResults,
  showStructureLocationActivation = false,
  state,
}: ProfessionalFiltersSectionProps) {
  const t = useTranslations('professional');
  const hasAvailabilityDate = state.selectedAvailabilityDate.length > 0;
  const hasAvailabilityFilter = state.selectedAvailability !== 'all';

  const availabilityStartDate = hasAvailabilityDate
    ? parseISO(state.selectedAvailabilityDate)
    : null;
  const availabilityEndDate =
    availabilityStartDate &&
    typeof state.selectedAvailabilityDurationDays === 'number' &&
    state.selectedAvailabilityDurationDays > 0
      ? addDays(
          availabilityStartDate,
          state.selectedAvailabilityDurationDays - 1
        )
      : null;

  const availabilitySummary =
    hasAvailabilityFilter && availabilityStartDate
      ? typeof state.selectedAvailabilityDurationDays === 'number' &&
        availabilityEndDate
        ? `${format(availabilityStartDate, 'dd/MM/yyyy')} - ${format(availabilityEndDate, 'dd/MM/yyyy')} (${state.selectedAvailabilityDurationDays} ${state.selectedAvailabilityDurationDays > 1 ? t('search.dayPlural') : t('search.daySingular')})`
        : `${format(availabilityStartDate, 'dd/MM/yyyy')}`
      : null;

  return (
    <div className='mb-6 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100 sm:px-6 sm:py-4'>
      <div className='flex w-1/2 flex-col'>
        <div className='mb-3 sm:mb-4'>
          <ProfessionalSearchInput
            onChange={actions.setSearchQuery}
            onClear={() => actions.setSearchQuery('')}
            value={state.searchQuery}
          />
        </div>

        <div className='grid grid-cols-1 gap-2 sm:grid-cols-4 sm:gap-3'>
          <div className='w-full'>
            <ProfessionalAvailabilitySelect
              onDateChange={actions.setSelectedAvailabilityDate}
              onDurationDaysChange={actions.setSelectedAvailabilityDurationDays}
              onOpenChange={actions.setIsAvailabilitySelectOpen}
              onValueChange={actions.setSelectedAvailability}
              open={state.isAvailabilitySelectOpen}
              selectedDate={state.selectedAvailabilityDate}
              selectedDurationDays={state.selectedAvailabilityDurationDays}
            />

            {availabilitySummary && (
              <div className='mt-2 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700'>
                <span>
                  {t('search.availability', { defaultValue: 'Availability' })}:{' '}
                  {availabilitySummary}
                </span>
                <button
                  aria-label={t('search.clear')}
                  className='ml-2 rounded-full p-1 text-blue-700 hover:bg-blue-100'
                  onClick={actions.clearAvailabilityFilter}
                  type='button'
                >
                  <X className='h-3 w-3' />
                </button>
              </div>
            )}
          </div>

          <div className='w-full'>
            <ProfessionalLocationInput
              onChange={actions.setLocationQuery}
              value={state.locationQuery}
            />
          </div>

          <div className='w-full'>
            <ProfessionalRoleSelect
              onOpenChange={actions.setIsRoleSelectOpen}
              onValueChange={actions.setSelectedRole}
              open={state.isRoleSelectOpen}
              value={state.selectedRole}
            />
          </div>

          <div className='flex w-full items-stretch'>
            <Button
              className='flex w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-white'
              onClick={actions.applyFilters}
              type='button'
            >
              <Search className='h-4 w-4' />
              <span>{t('search.searchButton')}</span>
            </Button>
          </div>
        </div>

        {showStructureLocationActivation && <StructureLocationActivation />}

        <ProfessionalActiveFilters
          hasResults={hasResults}
          locationQuery={state.appliedLocationQuery}
          onClearAll={actions.handleClearAllFilters}
          onClearAvailability={actions.clearAvailabilityFilter}
          onClearLocation={actions.clearLocationFilter}
          onClearRole={actions.clearRoleFilter}
          onClearSearch={() => actions.setSearchQuery('')}
          searchQuery={state.searchQuery}
          selectedAvailability={state.appliedAvailability}
          selectedRole={state.appliedRole}
        />
      </div>
    </div>
  );
}
