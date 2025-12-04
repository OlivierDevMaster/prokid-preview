import { createFactory } from '@hono/hono/factory';

import { apiResponse } from '../../_shared/utils/responses.ts';

interface HelloWorldRequestBody {
  name?: string;
}

const factory = createFactory();

export const helloWorldHandler = factory.createHandlers(async ({ req }) => {
  try {
    let name: string | undefined;

    if (req.method === 'POST') {
      try {
        const body: HelloWorldRequestBody = await req.json();
        name = body.name;
      } catch {
        // If JSON parsing fails, continue with undefined name
      }
    }

    const data = {
      message: `Hello ${name || 'World'} from Supabase Edge Function!`,
      timestamp: new Date().toISOString(),
    };

    return apiResponse.ok(data);
  } catch {
    return apiResponse.badRequest('INVALID_REQUEST_BODY');
  }
});
