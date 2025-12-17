import { z } from 'zod';

export const reportFormSchema = z.object({
  content: z.string().min(1, 'Le contenu du rapport est requis'),
  files: z.array(z.instanceof(File)).nullable().optional(),
  id: z.string().optional(),
  mission_id: z.string().min(1, 'La mission est requise'),
  title: z.string().min(1, 'Le titre est requis'),
});

export type ReportFormData = z.infer<typeof reportFormSchema>;
