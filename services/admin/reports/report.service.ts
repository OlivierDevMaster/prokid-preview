import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database/schema';

import { createClient as createBrowserClient } from '@/lib/supabase/client';

import type { Report } from './report.types';

type ReportInsert = Database['public']['Tables']['reports']['Insert'];

export async function createUserReport(
  report: ReportInsert
): Promise<null | Report> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('reports')
      .insert(report)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating report:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error creating report:', error);
    return null;
  }
}

export async function getReportById(reportId: string): Promise<null | Report> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    if (error) {
      console.error('Error fetching report:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Unexpected error fetching report:', error);
    return null;
  }
}

export async function getUserReports(userId: string): Promise<Report[]> {
  try {
    // Use service role key to bypass RLS and avoid infinite recursion
    // The RLS policy "Admins can view all profiles" queries the profiles table
    // which would trigger the same policy again, causing infinite recursion
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching reports:', error);
    return [];
  }
}

/**
 * Crée un client Supabase avec SERVICE_ROLE_KEY pour bypass RLS
 * Évite la récursion infinie causée par les politiques RLS qui vérifient les profils
 */
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
}
