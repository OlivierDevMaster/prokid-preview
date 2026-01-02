'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  getAdminActiveMissionsCount,
  getAdminActiveProfessionalsCount,
  getAdminActiveStructuresCount,
  getAdminMissionsCount,
  getAdminPendingInvitationsCount,
  getAdminPendingMissionsCount,
  getAdminProfessionalsCount,
  getAdminStructuresCount,
} from '@/features/admin/services/dashboard.service';

export function useGetDashboardStats() {
  // Fetch all counts
  const { data: professionalsCount = 0 } = useQuery({
    queryFn: getAdminProfessionalsCount,
    queryKey: ['dashboard', 'admin', 'professionals', 'total'],
  });

  const { data: activeProfessionalsCount = 0 } = useQuery({
    queryFn: getAdminActiveProfessionalsCount,
    queryKey: ['dashboard', 'admin', 'professionals', 'active'],
  });

  const { data: structuresCount = 0 } = useQuery({
    queryFn: getAdminStructuresCount,
    queryKey: ['dashboard', 'admin', 'structures', 'total'],
  });

  const { data: activeStructuresCount = 0 } = useQuery({
    queryFn: getAdminActiveStructuresCount,
    queryKey: ['dashboard', 'admin', 'structures', 'active'],
  });

  const { data: missionsCount = 0 } = useQuery({
    queryFn: getAdminMissionsCount,
    queryKey: ['dashboard', 'admin', 'missions', 'total'],
  });

  const { data: pendingMissionsCount = 0 } = useQuery({
    queryFn: getAdminPendingMissionsCount,
    queryKey: ['dashboard', 'admin', 'missions', 'pending'],
  });

  const { data: activeMissionsCount = 0 } = useQuery({
    queryFn: getAdminActiveMissionsCount,
    queryKey: ['dashboard', 'admin', 'missions', 'active'],
  });

  const { data: pendingInvitationsCount = 0 } = useQuery({
    queryFn: getAdminPendingInvitationsCount,
    queryKey: ['dashboard', 'admin', 'invitations', 'pending'],
  });

  return useMemo(
    () => ({
      activeMissionsCount,
      activeProfessionalsCount,
      activeStructuresCount,
      missionsCount,
      pendingInvitationsCount,
      pendingMissionsCount,
      professionalsCount,
      structuresCount,
    }),
    [
      activeMissionsCount,
      activeProfessionalsCount,
      activeStructuresCount,
      missionsCount,
      pendingInvitationsCount,
      pendingMissionsCount,
      professionalsCount,
      structuresCount,
    ]
  );
}
