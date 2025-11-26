import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { User } from "./user.types";

/**
 * Service pour gérer les utilisateurs
 * 
 * Note: Pour utiliser l'API Admin de Supabase, vous devez avoir
 * la SERVICE_ROLE_KEY dans vos variables d'environnement.
 * 
 * Si vous n'avez pas la SERVICE_ROLE_KEY, vous pouvez :
 * 1. Créer une table `users` dans votre base de données
 * 2. Utiliser une fonction Edge ou API route
 * 3. Synchroniser auth.users avec votre table users
 */
export class UserService {
  /**
   * Récupère tous les utilisateurs depuis Supabase Auth
   * Nécessite SERVICE_ROLE_KEY pour utiliser l'API Admin
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Cannot fetch users via Admin API.");
        // Alternative: Si vous avez une table users, utilisez-la
        return await this.getAllUsersFromTable();
      }

      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error) {
        console.error("Error fetching users:", error);
        return [];
      }

      // Transformer les données pour correspondre à notre interface User
      return users.map((user) => ({
        id: user.id,
        email: user.email || "",
        name: (user.user_metadata?.full_name || user.user_metadata?.name || null) as string | null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
        updated_at: user.updated_at || null,
        email_verified: user.email_confirmed_at ? true : false,
        last_sign_in_at: user.last_sign_in_at || null,
      }));
    } catch (error) {
      console.error("Unexpected error fetching users:", error);
      return [];
    }
  }

  /**
   * Alternative: Récupère les utilisateurs depuis une table `users` si elle existe
   */
  private static async getAllUsersFromTable(): Promise<User[]> {
    try {
      const supabase = await createClient();
      
      // Si vous avez une table users dans votre base de données
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users from table:", error);
        return [];
      }

      return (data || []).map((user: User) => ({
        id: user.id,
        email: user.email || "",
        name: user.name || null,
        avatar_url: user.avatar_url || null,
        created_at: user.created_at,
        updated_at: user.updated_at || null,
        email_verified: user.email_verified || false,
        last_sign_in_at: user.last_sign_in_at || null,
      }));
    } catch (error) {
      console.error("Error fetching users from table:", error);
      return [];
    }
  }

  /**
   * Récupère un utilisateur par ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // Alternative: Utiliser la table users
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error || !data) {
          return null;
        }

        return {
          id: data.id,
          email: data.email || "",
          name: data.name || null,
          avatar_url: data.avatar_url || null,
          created_at: data.created_at,
          updated_at: data.updated_at || null,
          email_verified: data.email_verified || false,
          last_sign_in_at: data.last_sign_in_at || null,
        };
      }

      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (error || !user) {
        console.error("Error fetching user:", error);
        return null;
      }

      return {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: user.created_at,
        updated_at: user.updated_at || null,
        email_verified: user.email_confirmed_at ? true : false,
        last_sign_in_at: user.last_sign_in_at || null,
      };
    } catch (error) {
      console.error("Unexpected error fetching user:", error);
      return null;
    }
  }
}

