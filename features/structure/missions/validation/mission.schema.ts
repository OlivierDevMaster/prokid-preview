import { z } from 'zod';

export type MissionPropositionFormValues = z.infer<
  ReturnType<typeof getMissionPropositionSchema>
>;

export type MissionPropositionSchemaTranslations = {
  (key: string): string;
};

export function getMissionPropositionSchema(
  t: MissionPropositionSchemaTranslations
) {
  return z
    .object({
      address: z.string(),
      description: z.string().min(1, t('validation.descriptionRequired')),
      desiredStartDate: z.date().optional(),
      durationDays: z
        .string()
        .optional()
        .refine(
          value =>
            value === undefined ||
            value === '' ||
            (!Number.isNaN(Number(value)) && Number(value) > 0),
          {
            message: t('validation.durationPositive'),
          }
        ),
      durationMode: z.enum(['duration', 'period']),
      modality: z.enum(['remote', 'on_site', 'hybrid']),
      periodEndDate: z.date().optional(),
      periodStartDate: z.date().optional(),
      professionalIds: z
        .array(z.string())
        .min(1, t('validation.professionalRequired')),
      title: z.string().min(1, t('validation.titleRequired')),
    })
    .superRefine((data, ctx) => {
      if (data.modality === 'on_site' || data.modality === 'hybrid') {
        if (!data.address || data.address.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.addressRequired'),
            path: ['address'],
          });
        }
      }

      if (data.durationMode === 'duration') {
        if (!data.durationDays) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.durationRequired'),
            path: ['durationDays'],
          });
        }
        if (!data.desiredStartDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.desiredStartRequired'),
            path: ['desiredStartDate'],
          });
        }
      }

      if (data.durationMode === 'period') {
        if (!data.periodStartDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.periodStartRequired'),
            path: ['periodStartDate'],
          });
        }
        if (!data.periodEndDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.periodEndRequired'),
            path: ['periodEndDate'],
          });
        }
        if (data.periodStartDate && data.periodEndDate) {
          if (data.periodEndDate < data.periodStartDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('validation.periodEndAfterStart'),
              path: ['periodEndDate'],
            });
          }
        }
      }
    });
}
