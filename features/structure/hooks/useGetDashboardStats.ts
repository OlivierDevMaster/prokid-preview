'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

import {
  getStructureActiveMembersCount,
  getStructureActiveMissionsCount,
  getStructureMissionsCount,
  getStructurePendingInvitationsCount,
  getStructurePendingMissionsCount,
  getStructureReceivedReportsCount,
} from '@/features/structure/services/dashboard.service';

export function useGetDashboardStats() {
  const { data: session } = useSession();
  const structureId = session?.user?.id;

  // Fetch active members count
  const { data: activeMembersCount = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructureActiveMembersCount(structureId);
    },
    queryKey: ['dashboard', 'structure', 'members', 'active', structureId],
  });

  // Fetch pending invitations count
  const { data: pendingInvitationsCount = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructurePendingInvitationsCount(structureId);
    },
    queryKey: ['dashboard', 'structure', 'invitations', 'pending', structureId],
  });

  // Fetch total missions count
  const { data: missionsCount = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructureMissionsCount(structureId);
    },
    queryKey: ['dashboard', 'structure', 'missions', 'total', structureId],
  });

  // Fetch pending missions count
  const { data: pendingMissionsCount = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructurePendingMissionsCount(structureId);
    },
    queryKey: ['dashboard', 'structure', 'missions', 'pending', structureId],
  });

  // Fetch active missions count
  const { data: activeMissionsCount = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructureActiveMissionsCount(structureId);
    },
    queryKey: ['dashboard', 'structure', 'missions', 'active', structureId],
  });

  // Fetch received reports count
  const { data: receivedReportsCount = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructureReceivedReportsCount(structureId);
    },
    queryKey: ['dashboard', 'structure', 'reports', 'received', structureId],
  });

  return useMemo(
    () => ({
      activeMembersCount,
      activeMissionsCount,
      missionsCount,
      pendingInvitationsCount,
      pendingMissionsCount,
      receivedReportsCount,
    }),
    [
      activeMembersCount,
      activeMissionsCount,
      missionsCount,
      pendingInvitationsCount,
      pendingMissionsCount,
      receivedReportsCount,
    ]
  );
}
