import { useEffect, useRef, useState } from 'react';

export interface ProfessionalSearchActions {
  applyFilters: () => void;
  applyLocationFilter: (value: string, coords?: { latitude: number; longitude: number }) => void;
  clearAvailabilityFilter: () => void;
  clearLocationFilter: () => void;
  clearRoleFilter: () => void;
  handleClearAllFilters: () => void;
  setIsAvailabilitySelectOpen: (value: boolean) => void;
  setIsRoleSelectOpen: (value: boolean) => void;
  setLocationQuery: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setSelectedAvailability: (value: string) => void;
  setSelectedAvailabilityDate: (value: string) => void;
  setSelectedAvailabilityDurationDays: (value: null | number) => void;
  setSelectedRole: (value: string) => void;
}

export interface ProfessionalSearchState {
  appliedAvailability: string;
  appliedLocationCoords: { latitude: number; longitude: number } | null;
  appliedLocationQuery: string;
  appliedRole: string;
  isAvailabilitySelectOpen: boolean;
  isRoleSelectOpen: boolean;
  locationQuery: string;
  searchQuery: string;
  selectedAvailability: string;
  selectedAvailabilityDate: string;
  selectedAvailabilityDurationDays: null | number;
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
  const [appliedLocationCoords, setAppliedLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [appliedRole, setAppliedRole] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] =
    useState<string>('all');
  const [selectedAvailabilityDate, setSelectedAvailabilityDate] =
    useState<string>('');
  const [
    selectedAvailabilityDurationDays,
    setSelectedAvailabilityDurationDays,
  ] = useState<null | number>(null);
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
    setSelectedAvailabilityDate('');
    setSelectedAvailabilityDurationDays(null);
    setAppliedLocationQuery('');
    setAppliedLocationCoords(null);
    setAppliedRole('all');
    setAppliedAvailability('all');
  };

  const applyFilters = () => {
    setAppliedLocationQuery(locationQuery);
    setAppliedRole(selectedRole);
    setAppliedAvailability(selectedAvailability);
  };

  const applyLocationFilter = (value: string, coords?: { latitude: number; longitude: number }) => {
    setAppliedLocationQuery(value);
    setAppliedLocationCoords(coords ?? null);
  };

  const clearAvailabilityFilter = () => {
    setSelectedAvailability('all');
    setSelectedAvailabilityDate('');
    setSelectedAvailabilityDurationDays(null);
    setAppliedAvailability('all');
  };

  const clearLocationFilter = () => {
    setLocationQuery('');
    setAppliedLocationQuery('');
    setAppliedLocationCoords(null);
  };

  const clearRoleFilter = () => {
    setSelectedRole('all');
    setAppliedRole('all');
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    appliedLocationQuery ||
    appliedRole !== 'all' ||
    appliedAvailability !== 'all'
  );

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
      applyLocationFilter,
      clearAvailabilityFilter,
      clearLocationFilter,
      clearRoleFilter,
      handleClearAllFilters,
      setIsAvailabilitySelectOpen,
      setIsRoleSelectOpen,
      setLocationQuery,
      setSearchQuery,
      setSelectedAvailability,
      setSelectedAvailabilityDate,
      setSelectedAvailabilityDurationDays,
      setSelectedRole,
    },
    hasActiveFilters,
    state: {
      appliedAvailability,
      appliedLocationCoords,
      appliedLocationQuery,
      appliedRole,
      isAvailabilitySelectOpen,
      isRoleSelectOpen,
      locationQuery,
      searchQuery,
      selectedAvailability,
      selectedAvailabilityDate,
      selectedAvailabilityDurationDays,
      selectedRole,
    },
  };
}
