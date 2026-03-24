'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useScrollToBottom } from '@/features/chat/hooks/useScrollToBottom';
import { useCreateRating } from '@/features/structure/ratings/hooks/useCreateRating';
import { useDeleteRating } from '@/features/structure/ratings/hooks/useDeleteRating';
import { useRatingForStructureAndProfessional } from '@/features/structure/ratings/hooks/useRatingForStructureAndProfessional';
import { useUpdateRating } from '@/features/structure/ratings/hooks/useUpdateRating';
import { useRouter } from '@/i18n/routing';

import type {
  ConversationWithDetails,
  MessageWithSender,
  ViewRole,
} from '../types/chat.types';

import { useDeleteMessage } from '../hooks/useDeleteMessage';
import { useSendMessage } from '../hooks/useSendMessage';
import { useUpdateAppointmentLink } from '../hooks/useUpdateAppointmentLink';
import { useUpdateAppointmentStatus } from '../hooks/useUpdateAppointmentStatus';
import { useUpdateMessageContent } from '../hooks/useUpdateMessageContent';
import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { ChatPanelHeader } from './ChatPanelHeader';
import { LeaveReviewModal } from './LeaveReviewModal';
import { MissionCard } from './MissionCard';
import { ProposeAppointmentModal } from './ProposeAppointmentModal';

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
  const [editingAppointmentMessage, setEditingAppointmentMessage] = useState<{
    content: string;
    id: string;
  } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{
    content: string;
    id: string;
  } | null>(null);
  const [proposeAppointmentOpen, setProposeAppointmentOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const { messagesContainerRef, messagesEndRef, scrollToBottom } =
    useScrollToBottom(conversation?.id, isLoadingMessages, messages.length);

  const sendMessage = useSendMessage(conversation?.id ?? null);
  const updateMessageContent = useUpdateMessageContent(
    conversation?.id ?? null
  );
  const deleteMessage = useDeleteMessage(conversation?.id ?? null);
  const updateAppointmentLink = useUpdateAppointmentLink(
    conversation?.id ?? null
  );
  const updateAppointmentStatus = useUpdateAppointmentStatus(
    conversation?.id ?? null
  );

  const router = useRouter();
  const structureId = conversation?.structure_id;
  const professionalId = conversation?.professional_id;
  const createRating = useCreateRating();

  const handleWriteReport = useCallback(() => {
    const missionId = conversation?.mission?.id;
    const query = missionId ? `?mission=${missionId}` : '';
    router.push(`/professional/reports/new${query}`);
  }, [conversation?.mission?.id, router]);

  const updateRating = useUpdateRating();
  const deleteRating = useDeleteRating();
  const { data: existingRating } = useRatingForStructureAndProfessional(
    viewRole === 'structure' ? structureId : undefined,
    viewRole === 'structure' ? professionalId : undefined
  );

  const otherPartyName = useMemo(
    () =>
      viewRole === 'structure'
        ? conversation?.professional?.profile?.first_name ||
          conversation?.professional?.profile?.last_name ||
          conversation?.professional?.profile?.email ||
          'Professionnel'
        : (conversation?.structure?.name ?? 'Structure'),
    [conversation, viewRole]
  );

  const otherPartyAddress = useMemo(
    () =>
      viewRole === 'professional' && conversation?.structure
        ? [
            conversation.structure.address,
            conversation.structure.postal_code,
            conversation.structure.city,
          ]
            .filter(Boolean)
            .join(', ')
        : null,
    [conversation, viewRole]
  );

  const handleSendText = useCallback(
    (content: string) => {
      if (!content || sendMessage.isPending) return;
      sendMessage.mutate({ content });
    },
    [sendMessage]
  );

  const handleReviewSubmit = useCallback(
    (rating: number, comment: string) => {
      if (!structureId || !professionalId) return;
      if (existingRating) {
        updateRating.mutate(
          {
            comment: comment.trim() || null,
            rating,
            ratingId: existingRating.id,
          },
          { onSuccess: () => setReviewModalOpen(false) }
        );
      } else {
        createRating.mutate(
          {
            comment: comment.trim() || null,
            professionalId,
            rating,
            structureId,
          },
          { onSuccess: () => setReviewModalOpen(false) }
        );
      }
    },
    [createRating, existingRating, professionalId, structureId, updateRating]
  );

  const handleRemoveReview = useCallback(
    (ratingId: string) => {
      deleteRating.mutate(ratingId, {
        onSuccess: () => setReviewModalOpen(false),
      });
    },
    [deleteRating]
  );

  const handleProposeAppointmentSubmit = useCallback(
    (link: string) => {
      if (editingAppointmentMessage) {
        updateAppointmentLink.mutate(
          { content: link, messageId: editingAppointmentMessage.id },
          { onSuccess: () => setEditingAppointmentMessage(null) }
        );
        return;
      }
      if (!conversation?.id || sendMessage.isPending) return;
      sendMessage.mutate(
        { content: link.trim(), type: 'appointment_link' },
        {
          onSuccess: () => {
            setProposeAppointmentOpen(false);
            scrollToBottom('smooth');
          },
        }
      );
    },
    [
      conversation?.id,
      editingAppointmentMessage,
      scrollToBottom,
      sendMessage,
      updateAppointmentLink,
    ]
  );

  const handleEditAppointmentLink = useCallback(
    (messageId: string, content: string) => {
      setEditingAppointmentMessage({ content, id: messageId });
    },
    []
  );

  const handleUpdateAppointmentStatus = useCallback(
    (messageId: string, status: 'cancelled' | 'confirmed' | 'rejected') => {
      updateAppointmentStatus.mutate({ messageId, status });
    },
    [updateAppointmentStatus]
  );

  const handleUpdateMessageContent = useCallback(
    (messageId: string, content: string) => {
      if (!conversation?.id) return;
      if (!content.trim()) return;
      updateMessageContent.mutate({ content, messageId });
      setEditingMessage(null);
    },
    [conversation?.id, updateMessageContent]
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      if (!conversation?.id) return;
      deleteMessage.mutate({ messageId });
    },
    [conversation?.id, deleteMessage]
  );

  const handleStartEditMessage = useCallback(
    (messageId: string, content: string) => {
      setEditingMessage({ content, id: messageId });
    },
    []
  );

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
      <ChatPanelHeader
        existingRating={
          viewRole === 'structure' ? (existingRating ?? null) : null
        }
        missionEnded={mission?.status === 'ended'}
        onOpenReview={() => setReviewModalOpen(true)}
        otherPartyAddress={otherPartyAddress}
        otherPartyAvatarUrl={
          viewRole === 'structure'
            ? (conversation.professional?.profile?.avatar_url ?? null)
            : null
        }
        otherPartyId={
          viewRole === 'structure' ? conversation.professional_id : undefined
        }
        otherPartyName={otherPartyName}
        viewRole={viewRole}
      />

      <LeaveReviewModal
        existingRating={
          viewRole === 'structure' ? (existingRating ?? null) : null
        }
        isOpen={reviewModalOpen}
        isSubmitting={
          createRating.isPending ||
          updateRating.isPending ||
          deleteRating.isPending
        }
        onClose={() => setReviewModalOpen(false)}
        onRemove={existingRating ? handleRemoveReview : undefined}
        onSubmit={handleReviewSubmit}
        revieweeName={otherPartyName}
      />

      <ProposeAppointmentModal
        initialLink={editingAppointmentMessage?.content ?? null}
        isSubmitting={sendMessage.isPending || updateAppointmentLink.isPending}
        onOpenChange={open => {
          if (!open) {
            setProposeAppointmentOpen(false);
            setEditingAppointmentMessage(null);
          }
        }}
        onSubmit={handleProposeAppointmentSubmit}
        open={proposeAppointmentOpen || editingAppointmentMessage != null}
      />

      {mission && (
        <div className='border-b bg-[#f8fafc] px-4 py-3'>
          <MissionCard
            conversationId={conversation.id}
            mission={mission}
            viewRole={viewRole}
          />
        </div>
      )}

      {/* Invite to rate after mission ended */}
      {viewRole === 'structure' &&
        mission?.status === 'ended' &&
        !existingRating && (
          <div className='flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-3'>
            <div className='flex items-center gap-2'>
              <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
              <p className='text-sm font-medium text-amber-800'>
                La mission est terminée ! Comment s&apos;est passée la
                collaboration avec {otherPartyName} ?
              </p>
            </div>
            <Button
              className='shrink-0 border-amber-300 bg-white text-amber-700 hover:bg-amber-50'
              onClick={() => setReviewModalOpen(true)}
              size='sm'
              variant='outline'
            >
              Donner mon avis
            </Button>
          </div>
        )}

      <ChatMessageList
        currentUserId={currentUserId}
        isLoadingMessages={isLoadingMessages}
        messages={messages}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        onDeleteMessage={handleDeleteMessage}
        onEditAppointmentLink={handleEditAppointmentLink}
        onStartEditMessage={handleStartEditMessage}
        onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
        viewRole={viewRole}
      />

      <ChatInput
        editingMessage={editingMessage}
        isSending={sendMessage.isPending}
        onCancelEdit={() => setEditingMessage(null)}
        onProposeAppointment={() => setProposeAppointmentOpen(true)}
        onSend={handleSendText}
        onUpdateMessage={handleUpdateMessageContent}
        onWriteReport={handleWriteReport}
        scrollToEndRef={messagesEndRef}
        viewRole={viewRole}
      />
    </div>
  );
}
