import { z } from 'zod';

export const CreateCheckoutSessionRequestBodySchema = z.object({
  cancelUrl: z.string().url('Invalid cancel URL'),
  successUrl: z.string().url('Invalid success URL'),
});

export type CreateCheckoutSessionRequestBody = z.infer<
  typeof CreateCheckoutSessionRequestBodySchema
>;

export const CreatePortalSessionRequestBodySchema = z.object({
  returnUrl: z.string().url('Invalid return URL'),
});

export type CreatePortalSessionRequestBody = z.infer<
  typeof CreatePortalSessionRequestBodySchema
>;

