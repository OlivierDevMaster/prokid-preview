import '@std/dotenv/load';
import { createClient } from '@supabase/supabase-js';

export class SupabaseTestClient {
  private static instance: SupabaseTestClient;
  private readonly supabaseAnonKey: string;
  private readonly supabaseKey: string;
  private readonly supabaseUrl: string;

  private constructor() {
    this.supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    this.supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    this.supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  }

  static getInstance(): SupabaseTestClient {
    if (!SupabaseTestClient.instance) {
      SupabaseTestClient.instance = new SupabaseTestClient();
    }
    return SupabaseTestClient.instance;
  }

  createAdminClient() {
    return createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${this.supabaseKey}`,
        },
      },
    });
  }

  createAnonymousClient() {
    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  createAuthenticatedClient(token: string) {
    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
  }
}
