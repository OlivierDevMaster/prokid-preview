'use client';

import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';

import type { MessageWithSender, ViewRole } from '../types/chat.types';

import { AppointmentMessageCard } from './AppointmentMessageCard';
import { ChatMessageBubble } from './ChatMessageBubble';

export interface ChatMessageProps {
  currentUserId: string | undefined;
  message: MessageWithSender;
  onCancel?: () => void;
  onConfirm?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onEditLink?: () => void;
  onRefuse?: () => void;
  viewRole: ViewRole;
}

export function ChatMessage({
  currentUserId,
  message,
  onCancel,
  onConfirm,
  onDelete,
  onEdit,
  onEditLink,
  onRefuse,
  viewRole,
}: ChatMessageProps) {
  const isOutgoing = message.sender_id === currentUserId;
  const senderName =
    message.sender?.first_name || message.sender?.last_name
      ? [message.sender.first_name, message.sender.last_name]
          .filter(Boolean)
          .join(' ')
      : (message.sender?.email ?? '');

  if (message.type === 'appointment_link') {
    return (
      <div className={`flex gap-2 ${isOutgoing ? 'flex-row-reverse' : ''}`}>
        {!isOutgoing && (
          <div
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${
              AVATAR_COLOR_VARIANTS[
                getAvatarColorVariantIndex(message.sender_id)
              ].bg
            } ${
              AVATAR_COLOR_VARIANTS[
                getAvatarColorVariantIndex(message.sender_id)
              ].text
            }`}
          >
            {senderName
              .split(' ')
              .map(s => s[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || '?'}
          </div>
        )}
        <AppointmentMessageCard
          message={message}
          onCancel={onCancel}
          onConfirm={onConfirm}
          onEditLink={onEditLink}
          onRefuse={onRefuse}
          viewRole={viewRole}
        />
      </div>
    );
  }

  return (
    <ChatMessageBubble
      isOutgoing={isOutgoing}
      message={message}
      onDelete={isOutgoing ? onDelete : undefined}
      onEdit={isOutgoing ? onEdit : undefined}
      senderName={senderName}
    />
  );
}
