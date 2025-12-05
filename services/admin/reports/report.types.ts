import { Tables } from '@/types/database/schema';

export interface CreateReportInput {
  contents: string;
  recipient_structure?: string;
  title: string;
}

/**
 * Types pour les rapports
 */
export type Report = Tables<'reports'>;
