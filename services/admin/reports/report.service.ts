import { createClient } from '@/lib/supabase/server';

import type { Report } from './report.types';

/**
 * Service pour gérer les rapports
 */
export class ReportService {
  /**
   * Récupère un rapport par son ID
   */
  static async getReportById(reportId: string): Promise<null | Report> {
    try {
      const supabase = await createClient();

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

  /**
   * Récupère tous les rapports de l'utilisateur courant
   */
  static async getUserReports(userId: string): Promise<Report[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user', userId)
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
}
