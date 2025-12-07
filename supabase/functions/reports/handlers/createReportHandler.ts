import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import {
  createReport,
  CreateReportRequestBodySchema,
} from '../../_shared/features/reports/index.ts';
import { validateRequest } from '../../_shared/utils/requests.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const createReportHandler = factory.createHandlers(
  async ({ get, req }) => {
    try {
      const user = get('user');
      const supabaseClient = get('supabaseClient');

      const validationResult = await validateRequest(
        CreateReportRequestBodySchema,
        req
      );

      if (!validationResult.success) {
        return validationResult.response;
      }

      const report = await createReport(supabaseClient, {
        author_id: user.id,
        content: validationResult.data.content,
        recipient_id: validationResult.data.recipient_id,
        title: validationResult.data.title,
      });

      return apiResponse.created(report);
    } catch (error) {
      console.error('Error creating report:', error);
      return apiResponse.internalServerError(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la création du rapport'
      );
    }
  }
);
