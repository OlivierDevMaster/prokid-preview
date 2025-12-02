export interface CreateReportInput {
  contents: string;
  recipient_structure?: string;
  title: string;
}

/**
 * Types pour les rapports
 */
export interface Report {
  contents: string;
  created_at: string;
  id: string;
  title: string;
  user: string;
}
