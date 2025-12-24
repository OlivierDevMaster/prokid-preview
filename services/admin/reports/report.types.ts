import { Tables } from '@/types/database/schema';

export interface CreateReportInput {
  contents: string;
  mission_id?: string;
  title: string;
}

/**
 * Types pour les rapports
 */
export type Report = Tables<'reports'>;
