'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import { useScrollToBottom } from '@/features/chat/hooks/useScrollToBottom';
import { useGetMembershipId } from '@/features/structure-members/hooks/useGetMembershipId';
import { useCreateRating } from '@/features/structure/ratings/hooks/useCreateRating';

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

  const structureId = conversation?.structure_id;
  const professionalId = conversation?.professional_id;
  const { data: membershipId } = useGetMembershipId(
    structureId,
    professionalId
  );
  const createRating = useCreateRating();

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
      if (!structureId || !professionalId || !membershipId) return;
      createRating.mutate(
        {
          comment: comment.trim() || null,
          membershipId,
          professionalId,
          rating,
          structureId,
        },
        { onSuccess: () => setReviewModalOpen(false) }
      );
    },
    [createRating, membershipId, professionalId, structureId]
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
        membershipId={membershipId}
        onOpenReview={() => setReviewModalOpen(true)}
        otherPartyAddress={otherPartyAddress}
        otherPartyName={otherPartyName}
        viewRole={viewRole}
      />

      <LeaveReviewModal
        isOpen={reviewModalOpen}
        isSubmitting={createRating.isPending}
        onClose={() => setReviewModalOpen(false)}
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
        scrollToEndRef={messagesEndRef}
        viewRole={viewRole}
      />
    </div>
  );
}
