import { useEffect, useRef, useState } from 'react';

export interface ProfessionalSearchActions {
  applyFilters: () => void;
  clearAvailabilityFilter: () => void;
  clearLocationFilter: () => void;
  clearRoleFilter: () => void;
  handleClearAllFilters: () => void;
  setIsAvailabilitySelectOpen: (value: boolean) => void;
  setIsRoleSelectOpen: (value: boolean) => void;
  setLocationQuery: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setSelectedAvailability: (value: string) => void;
  setSelectedRole: (value: string) => void;
}

export interface ProfessionalSearchState {
  appliedAvailability: string;
  appliedLocationQuery: string;
  appliedRole: string;
  isAvailabilitySelectOpen: boolean;
  isRoleSelectOpen: boolean;
  locationQuery: string;
  searchQuery: string;
  selectedAvailability: string;
  selectedRole: string;
}

export interface UseProfessionalSearchReturn {
  actions: ProfessionalSearchActions;
  hasActiveFilters: boolean;
  state: ProfessionalSearchState;
}

export function useProfessionalSearch(): UseProfessionalSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [appliedLocationQuery, setAppliedLocationQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [appliedRole, setAppliedRole] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] =
    useState<string>('all');
  const [appliedAvailability, setAppliedAvailability] = useState<string>('all');
  const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false);
  const [isAvailabilitySelectOpen, setIsAvailabilitySelectOpen] =
    useState(false);
  const isMountedRef = useRef(true);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setSelectedRole('all');
    setSelectedAvailability('all');
    setAppliedLocationQuery('');
    setAppliedRole('all');
    setAppliedAvailability('all');
  };

  const applyFilters = () => {
    setAppliedLocationQuery(locationQuery);
    setAppliedRole(selectedRole);
    setAppliedAvailability(selectedAvailability);
  };

  const clearAvailabilityFilter = () => {
    setSelectedAvailability('all');
    setAppliedAvailability('all');
  };

  const clearLocationFilter = () => {
    setLocationQuery('');
    setAppliedLocationQuery('');
  };

  const clearRoleFilter = () => {
    setSelectedRole('all');
    setAppliedRole('all');
  };

  const hasActiveFilters =
    searchQuery ||
    appliedLocationQuery ||
    appliedRole !== 'all' ||
    appliedAvailability !== 'all';

  // Close all Selects on unmount to prevent portal cleanup errors
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Close Selects on unmount to prevent portal cleanup errors
      // This ensures Radix portals are properly cleaned up before component unmounts
      setIsRoleSelectOpen(false);
      setIsAvailabilitySelectOpen(false);
    };
  }, []);

  return {
    actions: {
      applyFilters,
      clearAvailabilityFilter,
      clearLocationFilter,
      clearRoleFilter,
      handleClearAllFilters,
      setIsAvailabilitySelectOpen,
      setIsRoleSelectOpen,
      setLocationQuery,
      setSearchQuery,
      setSelectedAvailability,
      setSelectedRole,
    },
    hasActiveFilters,
    state: {
      appliedAvailability,
      appliedLocationQuery,
      appliedRole,
      isAvailabilitySelectOpen,
      isRoleSelectOpen,
      locationQuery,
      searchQuery,
      selectedAvailability,
      selectedRole,
    },
  };
}
