'use client';

import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';
import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';

import type { ConversationWithDetails, ViewRole } from '../types/chat.types';

import { MissionHistorySection } from './MissionHistorySection';
import { RecentReportsSection } from './RecentReportsSection';

interface ParticipantPanelProps {
  conversation: ConversationWithDetails | null;
  viewRole: ViewRole;
}

export function ParticipantPanel({
  conversation,
  viewRole,
}: ParticipantPanelProps) {
  const t = useTranslations('chat');
  const router = useRouter();

  if (!conversation) {
    return (
      <div className='hidden w-80 flex-shrink-0 border-l bg-muted/20 lg:block' />
    );
  }

  const isStructureOther = viewRole === 'professional';
  const structure = conversation.structure;
  const professional = conversation.professional;

  const name = isStructureOther
    ? (structure?.name ?? 'Structure')
    : professional?.profile?.first_name || professional?.profile?.last_name
      ? [professional?.profile?.first_name, professional?.profile?.last_name]
          .filter(Boolean)
          .join(' ')
      : (professional?.profile?.email ?? 'Professionnel');

  const address = isStructureOther
    ? [structure?.address, structure?.postal_code, structure?.city]
        .filter(Boolean)
        .join(', ')
    : (professional?.city ?? '');

  const profileLink = isStructureOther
    ? `/structure/professionals/${conversation.professional_id}`
    : `/professional/structures`;

  return (
    <aside className='hidden w-80 flex-shrink-0 flex-col border-l bg-muted/20 p-4 lg:flex'>
      <div className='mb-4'>
        {isStructureOther ? (
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
              <Building2 className='h-6 w-6 text-muted-foreground' />
            </div>
            <div>
              <h3 className='font-semibold'>{name}</h3>
              {address && (
                <p className='text-sm text-muted-foreground'>{address}</p>
              )}
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted'>
              {professional?.profile?.avatar_url ? (
                <Image
                  alt={name}
                  className='h-full w-full object-cover'
                  height={48}
                  src={professional.profile.avatar_url}
                  unoptimized
                  width={48}
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center rounded-full text-sm font-medium ${
                    AVATAR_COLOR_VARIANTS[
                      getAvatarColorVariantIndex(conversation.professional_id)
                    ].bg
                  } ${
                    AVATAR_COLOR_VARIANTS[
                      getAvatarColorVariantIndex(conversation.professional_id)
                    ].text
                  }`}
                >
                  {name
                    .split(' ')
                    .map(s => s[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <h3 className='font-semibold'>{name}</h3>
              {address && (
                <p className='text-sm text-muted-foreground'>{address}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <MissionHistorySection
        professionalId={conversation.professional_id}
        structureId={conversation.structure_id}
      />

      <RecentReportsSection
        professionalId={conversation.professional_id}
        structureId={conversation.structure_id}
        viewRole={viewRole}
      />

      <Button
        className='mt-auto w-full'
        onClick={() => router.push(profileLink)}
        variant='outline'
      >
        {t('viewFullProfile')}
      </Button>
    </aside>
  );
}
