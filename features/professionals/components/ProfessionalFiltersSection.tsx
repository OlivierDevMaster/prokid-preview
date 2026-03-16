'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { ProfessionalActiveFilters } from '@/features/professionals/components/filters/ProfessionalActiveFilters';
import { ProfessionalAvailabilitySelect } from '@/features/professionals/components/filters/ProfessionalAvailabilitySelect';
import { ProfessionalLocationInput } from '@/features/professionals/components/filters/ProfessionalLocationInput';
import { ProfessionalRoleSelect } from '@/features/professionals/components/filters/ProfessionalRoleSelect';
import { ProfessionalSearchInput } from '@/features/professionals/components/filters/ProfessionalSearchInput';

import {
  ProfessionalSearchActions,
  ProfessionalSearchState,
} from '../hooks/useProfessionalSearch';

interface ProfessionalFiltersSectionProps {
  actions: ProfessionalSearchActions;
  hasResults: boolean;
  state: ProfessionalSearchState;
}

export function ProfessionalFiltersSection({
  actions,
  hasResults,
  state,
}: ProfessionalFiltersSectionProps) {
  const t = useTranslations('professional');

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
              onOpenChange={actions.setIsAvailabilitySelectOpen}
              onValueChange={actions.setSelectedAvailability}
              open={state.isAvailabilitySelectOpen}
              value={state.selectedAvailability}
            />
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
