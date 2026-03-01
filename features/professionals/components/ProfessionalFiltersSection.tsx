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
    <div
      className='mb-6 rounded-lg bg-gray-100 p-4 ring-2 sm:p-6'
      style={{
        boxShadow: 'inset 0 1px 4px 1px rgba(59, 130, 246, 0.3)',
      }}
    >
      <div className='mb-4 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <ProfessionalSearchInput
          onChange={actions.setSearchQuery}
          onClear={() => actions.setSearchQuery('')}
          value={state.searchQuery}
        />

        <ProfessionalLocationInput
          onChange={actions.setLocationQuery}
          onClear={() => actions.setLocationQuery('')}
          value={state.locationQuery}
        />

        <ProfessionalRoleSelect
          onOpenChange={actions.setIsRoleSelectOpen}
          onValueChange={actions.setSelectedRole}
          open={state.isRoleSelectOpen}
          value={state.selectedRole}
        />

        <ProfessionalAvailabilitySelect
          onOpenChange={actions.setIsAvailabilitySelectOpen}
          onValueChange={actions.setSelectedAvailability}
          open={state.isAvailabilitySelectOpen}
          value={state.selectedAvailability}
        />
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
  );
}
