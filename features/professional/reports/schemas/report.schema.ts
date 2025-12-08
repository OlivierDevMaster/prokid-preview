import { z } from 'zod';

export const reportFormSchema = z.object({
  content: z.string().min(1, 'Le contenu du rapport est requis'),
  id: z.string().optional(),
  recipient_id: z.string().min(1, 'La structure destinataire est requise'),
  title: z.string().min(1, 'Le titre est requis'),
});

export type ReportFormData = z.infer<typeof reportFormSchema>;
