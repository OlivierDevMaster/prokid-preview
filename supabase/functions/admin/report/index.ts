// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d';
import { serve } from 'https://deno.land/std@0.168.0/http/server';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const handler = async req => {
  const data = await req.json();
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return new Response(
      JSON.stringify({
        error: 'bugs',
      })
    );
  }

  return new Response(
    JSON.stringify({
      data: user,
    });
  );

  const data = {
    message: `Hello ${name}!`,
  };

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

serve(handler);
