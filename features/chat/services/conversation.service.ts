import { createClient } from '@/lib/supabase/client';

import type {
  ConversationWithDetails,
  CreateConversationParams,
} from '../types/chat.types';

const CONVERSATIONS_SELECT = `
  id,
  structure_id,
  professional_id,
  mission_id,
  last_message_at,
  last_message_preview,
  created_at,
  updated_at,
  structure:structures(
    user_id,
    name,
    profile:profiles(user_id, first_name, last_name, avatar_url, email)
  ),
  professional:professionals(
    user_id,
    city,
    current_job,
    profile:profiles(user_id, first_name, last_name, avatar_url, email)
  ),
  mission:missions(
    id,
    title,
    description,
    status,
    mission_dtstart,
    mission_until,
    structure_id,
    professional_id
  )
`;

export async function createConversation(
  params: CreateConversationParams
): Promise<ConversationWithDetails> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      mission_id: params.mission_id ?? null,
      professional_id: params.professional_id,
      structure_id: params.structure_id,
    })
    .select(CONVERSATIONS_SELECT)
    .single();

  if (error) throw error;

  if (!data) {
    throw new Error('Failed to create conversation: no data returned');
  }

  return data as ConversationWithDetails;
}

export async function getConversation(
  conversationId: string
): Promise<ConversationWithDetails | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATIONS_SELECT)
    .eq('id', conversationId)
    .maybeSingle();

  if (error) throw error;

  return data as ConversationWithDetails | null;
}

export async function getConversations(): Promise<ConversationWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATIONS_SELECT)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as ConversationWithDetails[];
}

/** Find or create a conversation for the given structure, professional, and optional mission */
export async function getOrCreateConversation(
  params: CreateConversationParams
): Promise<ConversationWithDetails> {
  const supabase = createClient();

  let query = supabase
    .from('conversations')
    .select(CONVERSATIONS_SELECT)
    .eq('structure_id', params.structure_id)
    .eq('professional_id', params.professional_id);

  const { data: existing, error: findError } = await query.maybeSingle();

  if (findError) throw findError;

  if (existing) {
    return existing as ConversationWithDetails;
  }

  return createConversation(params);
}
