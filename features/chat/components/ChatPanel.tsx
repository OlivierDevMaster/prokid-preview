'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CalendarPlus,
  FileText,
  MapPin,
  MoreHorizontal,
  Plus,
  Send,
  Star,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useGetMembershipId } from '@/features/structure-members/hooks/useGetMembershipId';
import { useCreateRating } from '@/features/structure/ratings/hooks/useCreateRating';
import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';

import type {
  ConversationWithDetails,
  MessageWithSender,
  ViewRole,
} from '../types/chat.types';

import { useSendMessage } from '../hooks/useSendMessage';
import { LeaveReviewModal } from './LeaveReviewModal';
import { MissionCard } from './MissionCard';

const MIN_TEXTAREA_HEIGHT = 44;
const MAX_TEXTAREA_HEIGHT_PX = 18 * 16; // 18rem

interface ChatPanelProps {
  conversation: ConversationWithDetails | null;
  currentUserId: string | undefined;
  isLoadingMessages: boolean;
  messages: MessageWithSender[];
  viewRole: ViewRole;
}

export function ChatPanel({
  conversation,
  currentUserId,
  isLoadingMessages,
  messages,
  viewRole,
}: ChatPanelProps) {
  const t = useTranslations('chat');
  const [draft, setDraft] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useSendMessage(conversation?.id ?? null);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(MIN_TEXTAREA_HEIGHT, Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX))}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [draft, adjustTextareaHeight]);

  useEffect(() => {
    if (!conversation?.id) return;
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation?.id, isLoadingMessages]);

  const structureId = conversation?.structure_id;
  const professionalId = conversation?.professional_id;
  const { data: membershipId } = useGetMembershipId(
    structureId,
    professionalId
  );
  const createRating = useCreateRating();

  const otherPartyName =
    viewRole === 'structure'
      ? conversation?.professional?.profile?.first_name ||
        conversation?.professional?.profile?.last_name ||
        conversation?.professional?.profile?.email ||
        'Professionnel'
      : (conversation?.structure?.name ?? 'Structure');

  const otherPartyAddress =
    viewRole === 'professional' && conversation?.structure
      ? [
          conversation.structure.address,
          conversation.structure.postal_code,
          conversation.structure.city,
        ]
          .filter(Boolean)
          .join(', ')
      : null;

  const handleSend = useCallback(() => {
    const content = draft.trim();
    if (!content || sendMessage.isPending) return;
    sendMessage.mutate(
      { content },
      {
        onSuccess: () => {
          setDraft('');
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        },
      }
    );
  }, [draft, sendMessage]);

  const handleReviewSubmit = useCallback(
    (rating: number, comment: string) => {
      if (!structureId || !professionalId || !membershipId) return;
      createRating.mutate(
        {
          comment: comment.trim() || null,
          membershipId,
          professionalId,
          rating,
          structureId,
        },
        {
          onSuccess: () => setReviewModalOpen(false),
        }
      );
    },
    [createRating, membershipId, professionalId, structureId]
  );

  // Group messages by date
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

  if (!conversation) {
    return (
      <div className='flex flex-1 items-center justify-center bg-muted/20'>
        <p className='text-muted-foreground'>{t('selectConversation')}</p>
      </div>
    );
  }

  const mission = conversation.mission;

  return (
    <div className='flex flex-1 flex-col bg-background'>
      {/* Header */}
      <header className='flex items-center justify-between border-b px-4 py-3'>
        <div>
          <h2 className='font-semibold'>{otherPartyName}</h2>
          {otherPartyAddress && (
            <p className='flex items-center gap-1 text-sm text-muted-foreground'>
              <MapPin className='h-3.5 w-3.5' />
              {otherPartyAddress}
            </p>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {viewRole === 'structure' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={t('moreOptions')}
                  size='icon'
                  variant='ghost'
                >
                  <MoreHorizontal className='h-5 w-5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  disabled={!membershipId}
                  onClick={() => setReviewModalOpen(true)}
                >
                  <Star className='mr-2 h-4 w-4' />
                  {t('leaveReview')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <LeaveReviewModal
        isOpen={reviewModalOpen}
        isSubmitting={createRating.isPending}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        revieweeName={otherPartyName}
      />

      {/* Mission block */}
      {mission && (
        <div className='border-b bg-[#f8fafc] px-4 py-3'>
          <MissionCard mission={mission} />
        </div>
      )}

      {/* Messages */}
      <div
        className='flex-1 overflow-y-auto bg-[#f8fafc] p-4'
        ref={messagesContainerRef}
      >
        {isLoadingMessages ? (
          <p className='text-center text-sm text-muted-foreground'>
            {t('loadingMessages')}
          </p>
        ) : (
          <div className='space-y-4'>
            {messagesByDate.map(group => (
              <div key={group.dateLabel}>
                <p className='mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  {group.dateLabel}
                </p>
                <div className='space-y-3'>
                  {group.messages.map(msg => {
                    const isOutgoing = msg.sender_id === currentUserId;
                    const senderName =
                      msg.sender?.first_name || msg.sender?.last_name
                        ? [msg.sender.first_name, msg.sender.last_name]
                            .filter(Boolean)
                            .join(' ')
                        : (msg.sender?.email ?? '');

                    return (
                      <div
                        className={`flex gap-2 ${isOutgoing ? 'flex-row-reverse' : ''}`}
                        key={msg.id}
                      >
                        {!isOutgoing && (
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                              AVATAR_COLOR_VARIANTS[
                                getAvatarColorVariantIndex(msg.sender_id)
                              ].bg
                            } ${
                              AVATAR_COLOR_VARIANTS[
                                getAvatarColorVariantIndex(msg.sender_id)
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
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            isOutgoing
                              ? 'bg-[#4A90E2] text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className='whitespace-pre-wrap text-sm'>
                            {msg.content}
                          </p>
                          <p
                            className={`mt-1 text-xs ${isOutgoing ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                          >
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className='flex items-end justify-center gap-2 border-t p-3'>
        <div className='flex h-full items-center justify-center'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label={t('attach')} size='icon' variant='ghost'>
                <Plus className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuItem>
                <CalendarPlus className='mr-2 h-4 w-4' />
                {t('proposeMeeting')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className='mr-2 h-4 w-4' />
                {t('writeReport')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Textarea
          className='max-h-[18rem] min-h-[44px] resize-none rounded-md border-none bg-[#f1f5f9] px-4'
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t('writeMessagePlaceholder')}
          ref={textareaRef}
          rows={1}
          value={draft}
        />
        <Button
          aria-label={t('send')}
          className='h-11 w-11 shrink-0 rounded-full'
          disabled={!draft.trim() || sendMessage.isPending}
          onClick={handleSend}
          size='icon'
        >
          <Send className='h-5 w-5' />
        </Button>
      </div>
    </div>
  );
}

function formatMessageDate(dateStr: string, t: (k: string) => string): string {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d >= today) return t('today');
  if (d >= yesterday) return t('yesterday');
  return format(d, 'EEEE d MMM. yyyy', { locale: fr });
}
