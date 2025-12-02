/**
 * Types pour les utilisateurs
 */
export interface User {
  avatar_url?: null | string;
  created_at: string;
  email: string;
  email_verified?: boolean;
  id: string;
  last_sign_in_at?: null | string;
  name?: null | string;
  updated_at?: null | string;
}

export interface UserWithMetadata extends User {
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
  };
}
