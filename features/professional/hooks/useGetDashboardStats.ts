'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

import {
  getProfessionalAcceptedMissionsCount,
  getProfessionalDraftReportsCount,
  getProfessionalMissionsCount,
  getProfessionalPendingMissionsCount,
  getProfessionalReportsCount,
  getProfessionalSentReportsCount,
  getProfessionalStructuresCount,
  getProfessionalUpcomingMissionsCount,
} from '@/features/professional/services/dashboard.service';

export function useGetDashboardStats() {
  const { data: session } = useSession();
  const professionalId = session?.user?.id;

  // Fetch structures count
  const { data: structuresCount = 0 } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return getProfessionalStructuresCount(professionalId);
    },
    queryKey: [
      'dashboard',
      'professional',
      'structures',
      'total',
      professionalId,
    ],
  });

  // Fetch total missions count
  const { data: missionsCount = 0 } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return getProfessionalMissionsCount(professionalId);
    },
    queryKey: [
      'dashboard',
      'professional',
      'missions',
      'total',
      professionalId,
    ],
  });

  // Fetch pending missions count
  const { data: pendingMissionsCount = 0 } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return getProfessionalPendingMissionsCount(professionalId);
    },
    queryKey: [
      'dashboard',
      'professional',
      'missions',
      'pending',
      professionalId,
    ],
  });

  // Fetch accepted missions count
  const { data: acceptedMissionsCount = 0 } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return getProfessionalAcceptedMissionsCount(professionalId);
    },
    queryKey: [
      'dashboard',
      'professional',
      'missions',
      'accepted',
      professionalId,
    ],
  });

  // Fetch upcoming missions (next 30 days)
  const { data: upcomingMissionsCount = 0 } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return getProfessionalUpcomingMissionsCount(professionalId);
    },
    queryKey: [
      'dashboard',
      'professional',
      'missions',
      'upcoming',
      professionalId,
    ],
  });

  // Fetch total reports count
  const { data: reportsCount = 0 } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return getProfessionalReportsCount(professionalId);
    },
    queryKey: ['dashboard', 'professional', 'reports', 'total', professionalId],
  });

  // Fetch draft reports count
  const { data: draftReportsCount = 0 } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return getProfessionalDraftReportsCount(professionalId);
    },
    queryKey: ['dashboard', 'professional', 'reports', 'draft', professionalId],
  });

  // Fetch sent reports count
  const { data: sentReportsCount = 0 } = useQuery({
    enabled: !!professionalId,
    queryFn: async () => {
      if (!professionalId) {
        throw new Error('Professional ID is required');
      }
      return getProfessionalSentReportsCount(professionalId);
    },
    queryKey: ['dashboard', 'professional', 'reports', 'sent', professionalId],
  });

  return useMemo(
    () => ({
      acceptedMissionsCount,
      draftReportsCount,
      missionsCount,
      pendingMissionsCount,
      reportsCount,
      sentReportsCount,
      structuresCount,
      upcomingMissionsCount,
    }),
    [
      acceptedMissionsCount,
      draftReportsCount,
      missionsCount,
      pendingMissionsCount,
      reportsCount,
      sentReportsCount,
      structuresCount,
      upcomingMissionsCount,
    ]
  );
}
