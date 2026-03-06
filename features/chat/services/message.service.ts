import { createClient } from '@/lib/supabase/client';

import type {
  GetMessagesOptions,
  MessageWithSender,
  SendMessageParams,
} from '../types/chat.types';

const MESSAGES_SELECT = `
  id,
  conversation_id,
  sender_id,
  content,
  created_at,
  sender:profiles(user_id, first_name, last_name, avatar_url, email)
`;

export async function getMessages(
  conversationId: string,
  options: GetMessagesOptions = {}
): Promise<MessageWithSender[]> {
  const supabase = createClient();

  const limit = options.limit ?? 100;
  const from = options.offset ?? 0;
  const to = from + limit - 1;

  let query = supabase
    .from('messages')
    .select(MESSAGES_SELECT)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(from, to);

  if (options.from) {
    query = query.gt('created_at', options.from);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as MessageWithSender[];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  params: SendMessageParams
): Promise<MessageWithSender> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      content: params.content.trim(),
      conversation_id: conversationId,
      sender_id: senderId,
    })
    .select(MESSAGES_SELECT)
    .single();

  if (error) throw error;

  if (!data) {
    throw new Error('Failed to send message: no data returned');
  }

  return data as MessageWithSender;
}
