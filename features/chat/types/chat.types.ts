/**
 * Chat feature types for conversations and messages.
 * Mirrors DB tables: conversations, messages.
 */

export type AppointmentStatus =
  | 'cancelled'
  | 'confirmed'
  | 'pending'
  | 'rejected';

export type ConversationListFilters = {
  search?: string;
};

export interface ConversationRow {
  created_at: string;
  id: string;
  last_message_at: null | string;
  last_message_preview: null | string;
  last_message_sender_id: null | string;
  mission_id: null | string;
  professional_id: string;
  structure_id: string;
  updated_at: string;
}

export interface ConversationWithDetails extends ConversationRow {
  mission?: MissionRow | null;
  professional?: null | ProfessionalRow;
  structure?: null | StructureRow;
}

export type CreateConversationParams = {
  mission_id?: null | string;
  professional_id: string;
  structure_id: string;
};

export type GetMessagesOptions = {
  from?: string; // created_at cursor for pagination
  limit?: number;
  offset?: number;
};

export interface MessageRow {
  content: string;
  conversation_id: string;
  created_at: string;
  id: string;
  report_id?: null | string;
  sender_id: string;
  status?: AppointmentStatus | null;
  type?: MessageType;
}

export type MessageType = 'appointment_link' | 'report' | 'system' | 'text';

export interface MessageWithSender extends MessageRow {
  sender?: null | ProfileRow;
}

/** Mission fields used in conversation list / mission block */
export interface MissionRow {
  address: null | string;
  description: null | string;
  id: string;
  mission_dtstart: string;
  mission_until: string;
  modality?: 'hybrid' | 'on_site' | 'remote';
  professional_id: string;
  status: MissionStatus;
  structure_id: string;
  title: string;
}

export type MissionStatus =
  | 'accepted'
  | 'cancelled'
  | 'declined'
  | 'ended'
  | 'expired'
  | 'pending';

/** Professional fields used in chat */
export interface ProfessionalRow {
  city: null | string;
  current_job: null | string;
  profile?: null | ProfileRow;
  user_id: string;
}

/** Profile fields used in chat (from profiles table) */
export interface ProfileRow {
  avatar_url: null | string;
  email: string;
  first_name: null | string;
  last_name: null | string;
  user_id: string;
}

export type SendMessageParams = {
  content: string;
  type?: MessageType;
};

/** Structure fields used in chat */
export interface StructureRow {
  address: null | string;
  city: null | string;
  name: string;
  postal_code: null | string;
  profile?: null | ProfileRow;
  user_id: string;
}

export type UpdateAppointmentStatusParams = {
  status: 'confirmed' | 'rejected';
};

export type ViewRole = 'professional' | 'structure';
