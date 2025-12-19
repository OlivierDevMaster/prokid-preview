import { createClient } from '@/lib/supabase/client';

export async function updateEmail(newEmail: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
