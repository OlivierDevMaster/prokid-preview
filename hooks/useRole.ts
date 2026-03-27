'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { createClient } from '@/lib/supabase/client';
import {
  isAdmin,
  isProfessional,
  isStructure,
} from '@/supabase/functions/_shared/features/roles/role.service';

type UseRoleReturn = {
  // Current user role checks
  isAdmin: boolean;
  isLoading: boolean;
  isOnboarded: boolean | undefined;
  isProfessional: boolean;
  isStructure: boolean;
  // Functions to check other users' roles
  isUserAdmin: (userId: string) => Promise<boolean>;
  isUserProfessional: (userId: string) => Promise<boolean>;
  isUserStructure: (userId: string) => Promise<boolean>;
  // Current user ID
  userId: string | undefined;
};

export function useRole(): UseRoleReturn {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch current user's role
  const { data: role, isLoading } = useQuery({
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_onboarded')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data;
    },
    queryKey: ['user-role', userId],
  });

  // Helper functions to check other users' roles
  const isUserAdmin = async (targetUserId: string): Promise<boolean> => {
    const supabase = createClient();
    return await isAdmin(supabase, targetUserId);
  };

  const isUserProfessional = async (targetUserId: string): Promise<boolean> => {
    const supabase = createClient();
    return await isProfessional(supabase, targetUserId);
  };

  const isUserStructure = async (targetUserId: string): Promise<boolean> => {
    const supabase = createClient();
    return await isStructure(supabase, targetUserId);
  };

  return {
    isAdmin: role?.role === 'admin',
    isLoading,
    isOnboarded: role?.is_onboarded,
    isProfessional: role?.role === 'professional',
    isStructure: role?.role === 'structure',
    isUserAdmin,
    isUserProfessional,
    isUserStructure,
    userId,
  };
}
