import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Report, ReportInsert } from './report.model.ts';

import { Database } from '../../../../../types/database/schema.ts';

/**
 * Crée un client Supabase admin avec SERVICE_ROLE_KEY pour bypasser RLS
 * Évite la récursion infinie causée par les politiques RLS qui vérifient les profils
 */
const createAdminClient = (): SupabaseClient<Database> => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const createReport = async (
  supabase: SupabaseClient<Database>,
  insertData: ReportInsert
): Promise<Report> => {
  const { data, error } = await supabase
    .from('reports')
    .insert(insertData)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const getUserReports = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Report[]> => {
  // Use admin client to bypass RLS and avoid infinite recursion
  // The RLS policy "Admins can view all profiles" queries the profiles table
  // which would trigger the same policy again, causing infinite recursion
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('reports')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data || [];
};

export const getReportById = async (
  supabase: SupabaseClient<Database>,
  reportId: string
): Promise<null | Report> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .maybeSingle();

  if (error) throw error;

  return data;
};
