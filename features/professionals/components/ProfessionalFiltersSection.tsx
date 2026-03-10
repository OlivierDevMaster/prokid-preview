'use client';

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
  state: ProfessionalSearchState;
}

export function ProfessionalFiltersSection({
  actions,
  state,
}: ProfessionalFiltersSectionProps) {
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

        <div className='grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3'>
          <div className='w-full'>
            <ProfessionalLocationInput
              onChange={actions.setLocationQuery}
              onClear={() => actions.setLocationQuery('')}
              value={state.locationQuery}
            />
          </div>

          <div className='w-full'>
            <ProfessionalAvailabilitySelect
              onOpenChange={actions.setIsAvailabilitySelectOpen}
              onValueChange={actions.setSelectedAvailability}
              open={state.isAvailabilitySelectOpen}
              value={state.selectedAvailability}
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
        </div>

        <ProfessionalActiveFilters
          locationQuery={state.locationQuery}
          onClearAll={actions.handleClearAllFilters}
          onClearAvailability={() => actions.setSelectedAvailability('all')}
          onClearLocation={() => actions.setLocationQuery('')}
          onClearRole={() => actions.setSelectedRole('all')}
          onClearSearch={() => actions.setSearchQuery('')}
          searchQuery={state.searchQuery}
          selectedAvailability={state.selectedAvailability}
          selectedRole={state.selectedRole}
        />
      </div>
    </div>
  );
}
