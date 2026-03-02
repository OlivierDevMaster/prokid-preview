import { useEffect, useRef, useState } from 'react';

export interface ProfessionalSearchActions {
  handleClearAllFilters: () => void;
  setIsAvailabilitySelectOpen: (value: boolean) => void;
  setIsRoleSelectOpen: (value: boolean) => void;
  setLocationQuery: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setSelectedAvailability: (value: string) => void;
  setSelectedRole: (value: string) => void;
}

export interface ProfessionalSearchState {
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
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] =
    useState<string>('all');
  const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false);
  const [isAvailabilitySelectOpen, setIsAvailabilitySelectOpen] =
    useState(false);
  const isMountedRef = useRef(true);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setSelectedRole('all');
    setSelectedAvailability('all');
  };

  const hasActiveFilters =
    searchQuery ||
    locationQuery ||
    selectedRole !== 'all' ||
    selectedAvailability !== 'all';

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
      isAvailabilitySelectOpen,
      isRoleSelectOpen,
      locationQuery,
      searchQuery,
      selectedAvailability,
      selectedRole,
    },
  };
}
