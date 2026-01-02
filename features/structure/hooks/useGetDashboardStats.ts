'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

import {
  getStructureAcceptedInvitationsCount,
  getStructureActiveMembersCount,
  getStructureActiveMissionsCount,
  getStructureCompletedMissionsCount,
  getStructureMissionAcceptanceRate,
  getStructureMissionsCount,
  getStructurePendingInvitationsCount,
  getStructurePendingMissionsCount,
  getStructurePendingReportsCount,
  getStructureReceivedReportsCount,
  getStructureUpcomingMissionsCount,
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

  // Fetch accepted invitations count
  const { data: acceptedInvitationsCount = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructureAcceptedInvitationsCount(structureId);
    },
    queryKey: [
      'dashboard',
      'structure',
      'invitations',
      'accepted',
      structureId,
    ],
  });

  // Fetch completed missions count
  const { data: completedMissionsCount = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructureCompletedMissionsCount(structureId);
    },
    queryKey: ['dashboard', 'structure', 'missions', 'completed', structureId],
  });

  // Fetch pending reports count
  const { data: pendingReportsCount = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructurePendingReportsCount(structureId);
    },
    queryKey: ['dashboard', 'structure', 'reports', 'pending', structureId],
  });

  // Fetch mission acceptance rate
  const { data: missionAcceptanceRate = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructureMissionAcceptanceRate(structureId);
    },
    queryKey: [
      'dashboard',
      'structure',
      'missions',
      'acceptance-rate',
      structureId,
    ],
  });

  // Fetch upcoming missions count
  const { data: upcomingMissionsCount = 0 } = useQuery({
    enabled: !!structureId,
    queryFn: async () => {
      if (!structureId) {
        throw new Error('Structure ID is required');
      }
      return getStructureUpcomingMissionsCount(structureId);
    },
    queryKey: ['dashboard', 'structure', 'missions', 'upcoming', structureId],
  });

  return useMemo(
    () => ({
      acceptedInvitationsCount,
      activeMembersCount,
      activeMissionsCount,
      completedMissionsCount,
      missionAcceptanceRate,
      missionsCount,
      pendingInvitationsCount,
      pendingMissionsCount,
      pendingReportsCount,
      receivedReportsCount,
      upcomingMissionsCount,
    }),
    [
      acceptedInvitationsCount,
      activeMembersCount,
      activeMissionsCount,
      completedMissionsCount,
      missionAcceptanceRate,
      missionsCount,
      pendingInvitationsCount,
      pendingMissionsCount,
      pendingReportsCount,
      receivedReportsCount,
      upcomingMissionsCount,
    ]
  );
}
