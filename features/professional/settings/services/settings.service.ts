import { createClient } from '@/lib/supabase/client';

type UpdatePersonalInfoParams = {
  firstName: string;
  lastName: string;
  phone: null | string;
  userId: string;
};

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

export async function updatePersonalInfo({
  firstName,
  lastName,
  phone,
  userId,
}: UpdatePersonalInfoParams) {
  const supabase = createClient();

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
    })
    .eq('user_id', userId);

  if (profileError) {
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }

  const { error: professionalError } = await supabase
    .from('professionals')
    .update({
      phone: phone || null,
    })
    .eq('user_id', userId);

  if (professionalError) {
    throw new Error(
      `Failed to update professional: ${professionalError.message}`
    );
  }
}
