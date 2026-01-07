import { z } from 'zod';

export const SendNotificationEmailRequestBodySchema = z.object({
  notification_id: z.string().uuid('Notification ID must be a valid UUID'),
});

export type SendNotificationEmailRequestBody = z.infer<
  typeof SendNotificationEmailRequestBodySchema
>;
