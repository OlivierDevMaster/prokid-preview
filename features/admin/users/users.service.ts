import type { Tables } from '@/types/database/schema';

import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { createClient } from '@/lib/supabase/client';

export type AdminProfile = Tables<'profiles'>;

export type AdminProfileWithRelations = AdminProfile & {
  professional?: {
    city: string | null;
    description: string | null;
    skills: string[] | null;
    user_id: string;
  } | null;
  structure?: {
    name: string;
    structure_type: string | null;
    user_id: string;
  } | null;
};

export interface AdminUsersFilters {
  role?: 'admin' | 'all' | 'professional' | 'structure';
  search?: string;
}

const PAGE_DEFAULT = 1;
const PAGE_SIZE_DEFAULT = 10;

export async function getAdminUsers(
  filters: AdminUsersFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<AdminProfile>> {
  const supabase = createClient();

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' });

  if (filters.role && filters.role !== 'all') {
    query = query.eq('role', filters.role);
  }

  if (filters.search) {
    const search = `%${filters.search}%`;
    query = query.or(
      `first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search}`
    );
  }

  const page = paginationOptions.page ?? PAGE_DEFAULT;
  const limit = paginationOptions.limit ?? PAGE_SIZE_DEFAULT;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false });
  query = query.range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: (data ?? []) as AdminProfile[],
  };
}

export async function getAdminUser(
  userId: string
): Promise<AdminProfileWithRelations | null> {
  const supabase = createClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return null;

  const result: AdminProfileWithRelations = { ...profile };

  if (profile.role === 'professional') {
    const { data: professional } = await supabase
      .from('professionals')
      .select('user_id, city, description, skills')
      .eq('user_id', userId)
      .maybeSingle();

    result.professional = professional ?? null;
  }

  if (profile.role === 'structure') {
    const { data: structure } = await supabase
      .from('structures')
      .select('user_id, name, structure_type')
      .eq('user_id', userId)
      .maybeSingle();

    result.structure = structure ?? null;
  }

  return result;
}
