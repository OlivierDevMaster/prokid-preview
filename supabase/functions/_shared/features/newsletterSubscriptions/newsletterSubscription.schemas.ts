import { z } from 'zod';

export const CreateNewsletterSubscriptionRequestBodySchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional().nullable(),
});

export type CreateNewsletterSubscriptionRequestBody = z.infer<
  typeof CreateNewsletterSubscriptionRequestBodySchema
>;
