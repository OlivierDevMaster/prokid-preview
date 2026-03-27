import { z } from 'zod';

export type DaySchedule = {
  date: Date;
  endTime: string;
  startTime: string;
};

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
      dailyEndTime: z.string().default('17:00'),
      dailyStartTime: z.string().default('08:00'),
      daySchedules: z
        .array(
          z.object({
            date: z.date(),
            endTime: z.string(),
            startTime: z.string(),
          })
        )
        .optional()
        .default([]),
      description: z.string().min(1, t('validation.descriptionRequired')),
      endDate: z.date().optional(),
      modality: z.enum(['remote', 'on_site', 'hybrid']),
      professionalIds: z
        .array(z.string())
        .min(1, t('validation.professionalRequired')),
      sameHoursEveryDay: z.boolean().default(true),
      startDate: z.date().optional(),
      title: z.string().min(1, t('validation.titleRequired')),
    })
    .superRefine((data, ctx) => {
      // Address required for on_site/hybrid
      if (data.modality === 'on_site' || data.modality === 'hybrid') {
        if (!data.address || data.address.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.addressRequired'),
            path: ['address'],
          });
        }
      }

      // Dates required
      if (!data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.startDateRequired'),
          path: ['startDate'],
        });
      }
      if (!data.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.endDateRequired'),
          path: ['endDate'],
        });
      }

      // End date >= start date
      if (data.startDate && data.endDate && data.endDate < data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.endDateNotBeforeStart'),
          path: ['endDate'],
        });
      }

      // Time validation
      if (data.sameHoursEveryDay) {
        if (!data.dailyStartTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.startTimeRequired'),
            path: ['dailyStartTime'],
          });
        }
        if (!data.dailyEndTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.endTimeRequired'),
            path: ['dailyEndTime'],
          });
        }
        if (
          data.dailyStartTime &&
          data.dailyEndTime &&
          data.dailyEndTime <= data.dailyStartTime
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.endTimeAfterStart'),
            path: ['dailyEndTime'],
          });
        }
      } else {
        // Per-day validation
        const schedules = data.daySchedules || [];
        schedules.forEach((schedule, index) => {
          if (!schedule.startTime || !schedule.endTime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('validation.startTimeRequired'),
              path: ['daySchedules', index, 'startTime'],
            });
          }
          if (
            schedule.startTime &&
            schedule.endTime &&
            schedule.endTime <= schedule.startTime
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('validation.endTimeAfterStart'),
              path: ['daySchedules', index, 'endTime'],
            });
          }
        });
      }
    });
}
