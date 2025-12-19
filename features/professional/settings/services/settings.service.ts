import { createClient } from '@/lib/supabase/client';

export async function updateEmail(newEmail: string, emailRedirectTo?: string) {
  const supabase = createClient();

  const options = emailRedirectTo ? { emailRedirectTo } : undefined;

  const { data, error } = await supabase.auth.updateUser(
    { email: newEmail },
    options
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
