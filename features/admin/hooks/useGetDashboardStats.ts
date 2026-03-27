'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  getAdminActiveMissionsCount,
  getAdminActiveProfessionalsCount,
  getAdminActiveStructuresCount,
  getAdminAverageMissionsPerStructure,
  getAdminAverageProfessionalsPerStructure,
  getAdminCompletedMissionsCount,
  getAdminMissionCompletionRate,
  getAdminMissionsCount,
  getAdminMostActiveProfessional,
  getAdminMostActiveStructure,
  getAdminPendingInvitationsCount,
  getAdminPendingMissionsCount,
  getAdminProfessionalsCount,
  getAdminStructuresCount,
  getAdminStructureGrowthRate,
  getAdminSystemGrowthRate,
  getAdminPremiumProfessionalsCount,
  getAdminRegionBreakdown,
  getAdminTotalInvitationsCount,
  getAdminTotalReportsCount,
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

  const { data: totalInvitationsCount = 0 } = useQuery({
    queryFn: getAdminTotalInvitationsCount,
    queryKey: ['dashboard', 'admin', 'invitations', 'total'],
  });

  const { data: completedMissionsCount = 0 } = useQuery({
    queryFn: getAdminCompletedMissionsCount,
    queryKey: ['dashboard', 'admin', 'missions', 'completed'],
  });

  const { data: totalReportsCount = 0 } = useQuery({
    queryFn: getAdminTotalReportsCount,
    queryKey: ['dashboard', 'admin', 'reports', 'total'],
  });

  const { data: systemGrowthRate = 0 } = useQuery({
    queryFn: getAdminSystemGrowthRate,
    queryKey: ['dashboard', 'admin', 'system-growth'],
  });

  const { data: missionCompletionRate = 0 } = useQuery({
    queryFn: getAdminMissionCompletionRate,
    queryKey: ['dashboard', 'admin', 'missions', 'completion-rate'],
  });

  const { data: averageMissionsPerStructure = 0 } = useQuery({
    queryFn: getAdminAverageMissionsPerStructure,
    queryKey: ['dashboard', 'admin', 'missions', 'average-per-structure'],
  });

  const { data: averageProfessionalsPerStructure = 0 } = useQuery({
    queryFn: getAdminAverageProfessionalsPerStructure,
    queryKey: ['dashboard', 'admin', 'professionals', 'average-per-structure'],
  });

  const { data: mostActiveStructure = null } = useQuery({
    queryFn: getAdminMostActiveStructure,
    queryKey: ['dashboard', 'admin', 'structures', 'most-active'],
  });

  const { data: mostActiveProfessional = null } = useQuery({
    queryFn: getAdminMostActiveProfessional,
    queryKey: ['dashboard', 'admin', 'professionals', 'most-active'],
  });

  const { data: structureGrowthRate = 0 } = useQuery({
    queryFn: getAdminStructureGrowthRate,
    queryKey: ['dashboard', 'admin', 'structures', 'growth'],
  });

  const { data: premiumProfessionalsCount = 0 } = useQuery({
    queryFn: getAdminPremiumProfessionalsCount,
    queryKey: ['dashboard', 'admin', 'professionals', 'premium'],
  });

  const { data: regionBreakdown = [] } = useQuery({
    queryFn: getAdminRegionBreakdown,
    queryKey: ['dashboard', 'admin', 'regions'],
  });

  return useMemo(
    () => ({
      activeMissionsCount,
      activeProfessionalsCount,
      activeStructuresCount,
      averageMissionsPerStructure,
      averageProfessionalsPerStructure,
      completedMissionsCount,
      missionCompletionRate,
      missionsCount,
      mostActiveProfessional,
      mostActiveStructure,
      pendingInvitationsCount,
      pendingMissionsCount,
      premiumProfessionalsCount,
      professionalsCount,
      regionBreakdown,
      structureGrowthRate,
      structuresCount,
      systemGrowthRate,
      totalInvitationsCount,
      totalReportsCount,
    }),
    [
      activeMissionsCount,
      activeProfessionalsCount,
      activeStructuresCount,
      averageMissionsPerStructure,
      averageProfessionalsPerStructure,
      completedMissionsCount,
      missionCompletionRate,
      missionsCount,
      mostActiveProfessional,
      mostActiveStructure,
      pendingInvitationsCount,
      pendingMissionsCount,
      premiumProfessionalsCount,
      professionalsCount,
      regionBreakdown,
      structureGrowthRate,
      structuresCount,
      systemGrowthRate,
      totalInvitationsCount,
      totalReportsCount,
    ]
  );
}
