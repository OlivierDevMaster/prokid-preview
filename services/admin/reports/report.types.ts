/**
 * Types pour les rapports
 */
export interface Report {
  id: string;
  created_at: string;
  title: string;
  contents: string;
  user: string;
}

export interface CreateReportInput {
  title: string;
  contents: string;
  recipient_structure?: string;
}

