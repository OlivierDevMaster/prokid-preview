'use client';

import { format } from 'date-fns';

import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';

import type { MessageWithSender } from '../types/chat.types';

export interface ChatMessageBubbleProps {
  isOutgoing: boolean;
  message: MessageWithSender;
  senderName: string;
}

export function ChatMessageBubble({
  isOutgoing,
  message,
  senderName,
}: ChatMessageBubbleProps) {
  const avatarInitials =
    senderName
      .split(' ')
      .map(s => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
  const avatarVariant =
    AVATAR_COLOR_VARIANTS[getAvatarColorVariantIndex(message.sender_id)];

  return (
    <div className={`flex gap-2 ${isOutgoing ? 'flex-row-reverse' : ''}`}>
      {!isOutgoing && (
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${avatarVariant.bg} ${avatarVariant.text}`}
        >
          {avatarInitials}
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOutgoing ? 'bg-[#4A90E2] text-primary-foreground' : 'bg-muted'
        }`}
      >
        <p className='whitespace-pre-wrap text-sm'>{message.content}</p>
        <p
          className={`mt-1 text-xs ${isOutgoing ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
        >
          {format(new Date(message.created_at), 'HH:mm')}
        </p>
      </div>
    </div>
  );
}
