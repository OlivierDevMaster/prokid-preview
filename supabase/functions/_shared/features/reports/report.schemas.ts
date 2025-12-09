import { z } from 'zod';

export const CreateReportRequestBodySchema = z.object({
  content: z.string().min(1, 'Le contenu du rapport est requis'),
  mission_id: z.string().uuid("L'ID de la mission doit être un UUID valide"),
  title: z.string().min(1, 'Le titre est requis'),
});

export type CreateReportRequestBody = z.infer<
  typeof CreateReportRequestBodySchema
>;
