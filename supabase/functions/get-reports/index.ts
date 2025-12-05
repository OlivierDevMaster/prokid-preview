import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

import { apiResponse } from '../_shared/responses';

const corsHeaders = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return apiResponse.unauthorized('Missing authorization header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Récupérer l'utilisateur courant
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return apiResponse.unauthorized('Invalid or missing authentication');
    }

    // Récupérer les rapports de l'utilisateur
    const { data: reports, error: reportsError } = await supabaseClient
      .from('report')
      .select('*')
      .eq('user', user.id)
      .order('created_at', { ascending: false });

    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      return apiResponse.internalServerError('Failed to fetch reports');
    }

    return apiResponse.ok({ reports: reports || [] });
  } catch (error) {
    console.error('Get reports error:', error);
    return apiResponse.internalServerError(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
});
