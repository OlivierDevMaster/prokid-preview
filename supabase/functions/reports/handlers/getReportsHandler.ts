import { createFactory } from '@hono/hono/factory';
import { SupabaseClient, User } from '@supabase/supabase-js';

import { getUserReports } from '../../_shared/features/reports/index.ts';
import { apiResponse } from '../../_shared/utils/responses.ts';
import { Database } from '../../../../types/database/schema.ts';

type Variables = {
  supabaseAdminClient: SupabaseClient<Database>;
  supabaseClient: SupabaseClient<Database>;
  user: User;
};

const factory = createFactory<{ Variables: Variables }>();

export const getReportsHandler = factory.createHandlers(async ({ get }) => {
  try {
    const user = get('user');
    const supabaseClient = get('supabaseClient');

    const reports = await getUserReports(supabaseClient, user.id);

    return apiResponse.ok(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return apiResponse.internalServerError(
      error instanceof Error
        ? error.message
        : 'Erreur lors de la récupération des rapports'
    );
  }
});
