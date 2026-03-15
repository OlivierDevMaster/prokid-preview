'use client';

import { useTranslations } from 'next-intl';

import type { MessageWithSender, ViewRole } from '../types/chat.types';

export interface SystemMessageBadgeProps {
  message: MessageWithSender;
  viewRole: ViewRole;
}

export function SystemMessageBadge({
  message,
  viewRole,
}: SystemMessageBadgeProps) {
  const t = useTranslations('chat');
  const status = message.content as 'accepted' | 'cancelled' | 'declined';

  const key = getSystemMessageKey({
    status,
    viewRole,
  });

  const professionalName =
    message.sender?.first_name?.trim() || t('professionalFallback');
  const label =
    viewRole === 'structure' && (status === 'accepted' || status === 'declined')
      ? t(key, { name: professionalName })
      : t(key);

  return (
    <div className='flex w-full justify-center'>
      <span className='rounded-full bg-muted px-4 py-1 text-xs font-medium text-muted-foreground'>
        {label}
      </span>
    </div>
  );
}

function getSystemMessageKey(options: {
  status: 'accepted' | 'cancelled' | 'declined';
  viewRole: ViewRole;
}): string {
  const { status, viewRole } = options;

  if (viewRole === 'professional') {
    if (status === 'accepted') return 'systemMissionAcceptedPro';
    if (status === 'declined') return 'systemMissionDeclinedPro';
    if (status === 'cancelled') return 'systemMissionCancelledPro';
  } else {
    if (status === 'accepted') return 'systemMissionAcceptedStructure';
    if (status === 'declined') return 'systemMissionDeclinedStructure';
    if (status === 'cancelled') return 'systemMissionCancelledStructure';
  }

  return 'systemMissionAcceptedPro';
}
