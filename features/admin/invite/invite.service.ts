import { createClient } from '@/lib/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

export type InviteProfessionalData = {
  currentJob?: string;
  email: string;
  firstName?: string;
  invitedBy: string;
  lastName?: string;
};

export type InviteProfessionalResponse = {
  email: string;
  firstName?: string;
  lastName?: string;
  userId: string;
};

export type InvitedProfessional = {
  created_at: string;
  email: string;
  first_name: string | null;
  invitation_status: string;
  last_name: string | null;
  user_id: string;
};

export async function inviteProfessional(
  data: InviteProfessionalData
): Promise<InviteProfessionalResponse> {
  const supabase = createClient();

  return invokeEdgeFunction<
    InviteProfessionalResponse,
    InviteProfessionalData
  >(supabase, 'invite-professional', {
    body: data,
    method: 'POST',
  });
}

export async function getInvitedProfessionals(): Promise<
  InvitedProfessional[]
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, email, first_name, last_name, invitation_status, created_at')
    .eq('invitation_status', 'invited')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as InvitedProfessional[];
}
