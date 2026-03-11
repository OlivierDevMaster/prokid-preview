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
  type,
  status,
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
  const type = params.type ?? 'text';
  const payload: {
    content: string;
    conversation_id: string;
    sender_id: string;
    status?: string;
    type: string;
  } = {
    content: params.content.trim(),
    conversation_id: conversationId,
    sender_id: senderId,
    type,
  };
  if (type === 'appointment_link') {
    payload.status = 'pending';
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(payload)
    .select(MESSAGES_SELECT)
    .single();

  if (error) throw error;

  if (!data) {
    throw new Error('Failed to send message: no data returned');
  }

  return data as MessageWithSender;
}

export async function updateMessageContent(
  messageId: string,
  content: string
): Promise<MessageWithSender> {
  const supabase = createClient();

  const message = await supabase.from('messages').select(MESSAGES_SELECT).eq('id', messageId).maybeSingle();

  console.log('message', message.data);
  console.log('error', message.error);

  const { data, error } = await supabase
    .from('messages')
    .update({ content: content.trim() })
    .eq('id', messageId)
    .select(MESSAGES_SELECT)
    .maybeSingle();

  if (error) throw error;

  if (data === null) {
    throw new Error(
      'Failed to update message content: message not found or you do not have permission to update it'
    );
  }

  return data as MessageWithSender;
}

export async function updateMessageStatus(
  messageId: string,
  status: 'cancelled' | 'confirmed' | 'rejected'
): Promise<MessageWithSender> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('messages')
    .update({ status })
    .eq('id', messageId)
    .select(MESSAGES_SELECT)
    .maybeSingle();

  if (error) throw error;

  if (data === null) {
    throw new Error(
      'Failed to update message status: message not found or you do not have permission to update it'
    );
  }

  return data as MessageWithSender;
}
