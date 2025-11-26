/**
 * Types pour les utilisateurs
 */
export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string | null;
  email_verified?: boolean;
  last_sign_in_at?: string | null;
}

export interface UserWithMetadata extends User {
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}

