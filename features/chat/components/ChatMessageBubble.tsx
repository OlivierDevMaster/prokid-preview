'use client';

import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';

import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';

import type { MessageWithSender } from '../types/chat.types';
import { cn } from '@/lib/utils';

export interface ChatMessageBubbleProps {
  isOutgoing: boolean;
  message: MessageWithSender;
  onDelete?: () => void;
  onEdit?: () => void;
  senderName: string;
}

export function ChatMessageBubble({
  isOutgoing,
  message,
  onDelete,
  onEdit,
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
    <div className={`group flex gap-2 ${isOutgoing ? 'flex-row-reverse' : ''}`}>
      {!isOutgoing && (
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${avatarVariant.bg} ${avatarVariant.text}`}
        >
          {avatarInitials}
        </div>
      )}
      <div className='flex max-w-[75%] items-end gap-1'>
        {isOutgoing && (onEdit || onDelete) && (
          <div className='flex items-center gap-1 self-start opacity-0 transition-opacity group-hover:opacity-100'>
            {onEdit && (
              <button
                aria-label='Edit message'
                className='inline-flex size-8 items-center justify-center rounded-full text-xs text-muted-foreground hover:bg-muted/70'
                onClick={onEdit}
                type='button'
              >
                <Pencil className='size-4' />
              </button>
            )}
            {onDelete && (
              <button
                aria-label='Delete message'
                className='inline-flex size-8 items-center justify-center rounded-full text-xs text-muted-foreground hover:bg-red-50 hover:text-red-600'
                onClick={onDelete}
                type='button'
              >
                <Trash2 className='size-4' />
              </button>
            )}
          </div>
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOutgoing ? 'bg-[#4A90E2] text-primary-foreground' : 'bg-muted'
          )}
        >
          <p className='whitespace-pre-wrap text-sm'>{message.content}</p>
          <p
            className={cn(
              'mt-1 text-xs',
              isOutgoing
                ? 'text-primary-foreground/80'
                : 'text-muted-foreground'
            )}
          >
            {format(new Date(message.created_at), 'HH:mm')}
          </p>
        </div>
      </div>
    </div>
  );
}
