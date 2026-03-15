'use client';

import { useTranslations } from 'next-intl';
import { type RefObject, useMemo } from 'react';

import type { MessageWithSender, ViewRole } from '../types/chat.types';

import { formatMessageDate } from '../utils/formatMessageDate';
import { ChatMessage } from './ChatMessage';

export interface ChatMessageListProps {
  currentUserId: string | undefined;
  isLoadingMessages: boolean;
  messages: MessageWithSender[];
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onDeleteMessage: (messageId: string) => void;
  onEditAppointmentLink: (messageId: string, content: string) => void;
  onStartEditMessage: (messageId: string, content: string) => void;
  onUpdateAppointmentStatus: (
    messageId: string,
    status: 'cancelled' | 'confirmed' | 'rejected'
  ) => void;
  viewRole: ViewRole;
}

export function ChatMessageList({
  currentUserId,
  isLoadingMessages,
  messages,
  messagesContainerRef,
  messagesEndRef,
  onDeleteMessage,
  onEditAppointmentLink,
  onStartEditMessage,
  onUpdateAppointmentStatus,
  viewRole,
}: ChatMessageListProps) {
  const t = useTranslations('chat');

  const messagesByDate = useMemo(() => {
    const groups: { dateLabel: string; messages: MessageWithSender[] }[] = [];
    let currentLabel = '';
    for (const m of messages) {
      const label = formatMessageDate(m.created_at, k => t(k));
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ dateLabel: label, messages: [m] });
      } else {
        groups[groups.length - 1].messages.push(m);
      }
    }
    return groups;
  }, [messages, t]);

  if (isLoadingMessages) {
    return (
      <div
        className='flex-1 overflow-y-auto bg-[#f8fafc] p-4'
        ref={messagesContainerRef}
      >
        <p className='text-center text-sm text-muted-foreground'>
          {t('loadingMessages')}
        </p>
      </div>
    );
  }

  return (
    <div
      className='flex-1 overflow-y-auto bg-[#f8fafc] p-4'
      ref={messagesContainerRef}
    >
      <div className='space-y-4'>
        {messagesByDate.map(group => (
          <div key={group.dateLabel}>
            <p className='mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              {group.dateLabel}
            </p>
            <div className='space-y-3'>
              {group.messages.map(msg => (
                <ChatMessage
                  currentUserId={currentUserId}
                  key={msg.id}
                  message={msg}
                  onCancel={
                    viewRole === 'professional' && msg.status === 'pending'
                      ? () => onUpdateAppointmentStatus(msg.id, 'cancelled')
                      : undefined
                  }
                  onConfirm={
                    viewRole === 'structure' && msg.status === 'pending'
                      ? () => onUpdateAppointmentStatus(msg.id, 'confirmed')
                      : undefined
                  }
                  onDelete={() => onDeleteMessage(msg.id)}
                  onEdit={() => onStartEditMessage(msg.id, msg.content)}
                  onEditLink={
                    viewRole === 'professional' && msg.status === 'pending'
                      ? () => onEditAppointmentLink(msg.id, msg.content)
                      : undefined
                  }
                  onRefuse={
                    viewRole === 'structure' && msg.status === 'pending'
                      ? () => onUpdateAppointmentStatus(msg.id, 'rejected')
                      : undefined
                  }
                  viewRole={viewRole}
                />
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
