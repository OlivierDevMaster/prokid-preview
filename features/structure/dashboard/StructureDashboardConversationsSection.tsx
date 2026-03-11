import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, MessagesSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import type { ConversationWithDetails } from '@/features/chat/types/chat.types';

import { useConversations } from '@/features/chat/hooks/useConversations';
import { Link } from '@/i18n/routing';

export function StructureDashboardConversationsSection() {
  const tStructureDashboard = useTranslations('structure.dashboard');
  const tChat = useTranslations('chat');
  const { data: session } = useSession();
  const { data: conversationsData, isLoading } = useConversations();

  const structureUserId = session?.user?.id;

  const conversations =
    conversationsData
      ?.filter(
        conversation =>
          !structureUserId || conversation.structure_id === structureUserId
      )
      .slice(0, 2) ?? [];

  return (
    <section>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-xl font-bold text-slate-900'>
          <MessagesSquare className='h-5 w-5 text-[#4A90E2]' />
          {tStructureDashboard('conversationsCardTitle')}
        </h2>
      </div>
      <div className='overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm'>
        {isLoading ? (
          <div className='p-6 text-sm text-slate-600'>
            {tChat('loadingConversations')}
          </div>
        ) : conversations.length === 0 ? (
          <div className='p-6 text-sm text-slate-600'>
            {tChat('noConversations')}
          </div>
        ) : (
          <div className='divide-y divide-slate-100'>
            {conversations.map(conversation => {
              const title = getConversationTitle(conversation);
              const timeAgo = getConversationSubtitle(conversation, tChat);
              const preview =
                conversation.last_message_preview ??
                tChat('writeMessagePlaceholder');
              const isNew = isNewConversation(conversation);

              return (
                <Link
                  className='block p-6 transition-colors hover:bg-slate-50'
                  href={`/structure/chat?conversationId=${conversation.id}`}
                  key={conversation.id}
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700'>
                      <MessageCircle className='h-5 w-5' />
                    </div>
                    <div className='flex-1'>
                      <div className='mb-1 flex items-start justify-between'>
                        <div>
                          <h3 className='font-semibold text-slate-900'>
                            {title || tChat('selectConversation')}
                          </h3>
                          <p className='text-xs text-slate-500'>{timeAgo}</p>
                        </div>
                        {isNew && (
                          <span className='rounded-full bg-[#4A90E2]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#4A90E2]'>
                            {tStructureDashboard('conversationNewBadge')}
                          </span>
                        )}
                      </div>
                      <p className='mt-1 line-clamp-1 text-sm italic text-slate-600'>
                        {preview}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <div className='flex justify-end border-t border-slate-100 bg-slate-50 p-4'>
          <Link href='/structure/chat'>
            <button
              className='flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-[#4A90E2] transition-colors hover:bg-slate-100'
              type='button'
            >
              {tStructureDashboard('conversationCta')}
              <MessageCircle className='h-4 w-4' />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function getConversationSubtitle(
  conversation: ConversationWithDetails,
  tChat: ReturnType<typeof useTranslations>
) {
  if (!conversation.last_message_at) {
    return tChat('noConversations');
  }

  const distance = formatDistanceToNow(new Date(conversation.last_message_at), {
    addSuffix: true,
    locale: fr,
  });

  return distance;
}

function getConversationTitle(conversation: ConversationWithDetails) {
  if (conversation.mission?.title) {
    return conversation.mission.title;
  }

  const profile = conversation.professional?.profile;
  if (profile?.first_name || profile?.last_name) {
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  }

  return profile?.email ?? '';
}

function isNewConversation(conversation: ConversationWithDetails) {
  if (!conversation.last_message_at) {
    return false;
  }

  const lastMessageDate = new Date(conversation.last_message_at);
  const now = new Date();
  const diffInHours =
    (now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60);

  return diffInHours <= 24;
}
