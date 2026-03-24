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
    <div className='border-b border-slate-200 bg-white px-6 py-8 md:px-10'>
      <div className='mx-auto flex max-w-7xl items-center gap-3'>
        {/* Search bar: text + location (Malt style) */}
        <div className='flex flex-1 items-center rounded-xl border border-slate-200 bg-white shadow-sm'>
          <Search className='ml-4 h-4 w-4 flex-shrink-0 text-slate-400' />
          <input
            className='h-11 min-w-0 flex-[2] border-none bg-transparent px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400'
            onChange={e => actions.setSearchQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            type='text'
            value={state.searchQuery}
          />
          <div className='h-6 w-px bg-slate-200' />
          <div className='flex-1'>
            <ProfessionalLocationInput
              onChange={(value, coords) => {
                actions.setLocationQuery(value);
                actions.applyLocationFilter(value, coords);
              }}
              value={state.locationQuery}
            />
          </div>
        </div>

        {/* Filters + Search button */}
        <ProfessionalAvailabilitySelect
          onDateChange={actions.setSelectedAvailabilityDate}
          onDurationDaysChange={actions.setSelectedAvailabilityDurationDays}
          onOpenChange={actions.setIsAvailabilitySelectOpen}
          onValueChange={actions.setSelectedAvailability}
          open={state.isAvailabilitySelectOpen}
          selectedDate={state.selectedAvailabilityDate}
          selectedDurationDays={state.selectedAvailabilityDurationDays}
        />
        <ProfessionalRoleSelect
          onOpenChange={actions.setIsRoleSelectOpen}
          onValueChange={actions.setSelectedRole}
          open={state.isRoleSelectOpen}
          value={state.selectedRole}
        />
        <Button
          className='flex h-11 items-center gap-2 rounded-xl bg-[#4A90E2] px-5 text-sm font-semibold text-white shadow-sm hover:opacity-90'
          onClick={actions.applyFilters}
          type='button'
        >
          <Search className='h-4 w-4' />
          <span>{t('search.searchButton')}</span>
        </Button>
      </div>

      {/* Active filters + availability summary */}
      {(availabilitySummary || showStructureLocationActivation) && (
        <div className='mx-auto mt-3 max-w-7xl'>
          {availabilitySummary && (
            <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs text-blue-700'>
              <span>{availabilitySummary}</span>
              <button
                aria-label={t('search.clear')}
                className='rounded-full p-0.5 hover:bg-blue-100'
                onClick={actions.clearAvailabilityFilter}
                type='button'
              >
                <X className='h-3 w-3' />
              </button>
            </div>
          )}
          {showStructureLocationActivation && <StructureLocationActivation />}
        </div>
      )}

      <div className='mx-auto max-w-7xl'>
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
