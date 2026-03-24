import { useQueryClient } from '@tanstack/react-query';
import {
  differenceInMonths,
  differenceInWeeks,
  format,
  isValid,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  MapPin,
  Timer,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAcceptMission } from '@/features/missions/hooks/useAcceptMission';
import { useDeclineMission } from '@/features/missions/hooks/useDeclineMission';
import { cn } from '@/lib/utils';

import type { MissionRow, MissionStatus, ViewRole } from '../types/chat.types';

import { conversationQueryKey } from '../hooks/useConversation';
import { MissionStatusBadge } from './MissionStatusBadge';

const MODALITY_I18N_KEYS: Record<
  'hybrid' | 'on_site' | 'remote',
  'modalityHybrid' | 'modalityOnSite' | 'modalityRemote'
> = {
  hybrid: 'modalityHybrid',
  on_site: 'modalityOnSite',
  remote: 'modalityRemote',
} as const;

export interface MissionCardProps {
  conversationId?: null | string;
  mission: Partial<
    Pick<
      MissionRow,
      | 'description'
      | 'id'
      | 'mission_dtstart'
      | 'mission_until'
      | 'modality'
      | 'status'
      | 'title'
    >
  >;
  viewRole: ViewRole;
}

export function MissionCard({
  conversationId,
  mission,
  viewRole,
}: MissionCardProps) {
  const t = useTranslations('chat');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const queryClient = useQueryClient();
  const acceptMission = useAcceptMission();
  const declineMission = useDeclineMission();

  const status: MissionStatus | undefined = mission?.status;
  const missionId = mission?.id;

  const invalidateConversation = () => {
    if (conversationId) {
      queryClient.invalidateQueries({
        queryKey: conversationQueryKey(conversationId),
      });
    }
  };

  const handleAccept = () => {
    if (!missionId) return;
    acceptMission.mutate(missionId, { onSuccess: invalidateConversation });
  };

  const handleDecline = () => {
    if (!missionId) return;
    declineMission.mutate(missionId, { onSuccess: invalidateConversation });
  };

  const title = mission?.title ?? '';
  const description = mission?.description ?? '';
  const startDate = mission?.mission_dtstart;
  const startDateFormatted = (() => {
    const d = parseDate(startDate ?? null);
    return d ? format(d, 'd MMM. yyyy', { locale: fr }) : '—';
  })();

  const durationStr = (() => {
    const start = parseDate(mission?.mission_dtstart);
    const until = parseDate(mission?.mission_until);
    if (start && until && until > start) {
      const months = differenceInMonths(until, start);
      if (months > 0) return t('durationMonths', { count: months });
      const weeks = differenceInWeeks(until, start);
      return t('durationWeeks', { count: weeks });
    }
    return '—';
  })();

  const modality =
    mission?.modality != null ? t(MODALITY_I18N_KEYS[mission.modality]) : '—';

  return (
    <Card className='rounded-xl border bg-white px-4 py-3 shadow-sm'>
      <CardHeader
        className={cn('space-y-0 px-0 pb-1 pt-0', isCollapsed && 'pb-0')}
      >
        <div className='flex items-center justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-1.5'>
            <ClipboardList className='h-4 w-4 shrink-0 text-primary' />
            <CardTitle className='truncate text-sm font-bold text-primary'>
              {title}
            </CardTitle>
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            {status ? <MissionStatusBadge status={status} /> : null}
            <Button
              aria-label={
                isCollapsed ? t('missionCardExpand') : t('missionCardCollapse')
              }
              className='h-6 w-6 rounded-full p-0'
              onClick={() => setIsCollapsed(prev => !prev)}
              size='icon'
              variant='ghost'
            >
              {isCollapsed ? (
                <ChevronDown className='h-3.5 w-3.5' />
              ) : (
                <ChevronUp className='h-3.5 w-3.5' />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className='space-y-2 px-0 pb-2 pt-0'>
          {description ? (
            <p className='text-xs leading-snug text-muted-foreground'>
              {description}
            </p>
          ) : null}
          <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-gray-100 pt-1.5 text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <Timer className='h-3.5 w-3.5 shrink-0' />
              <div>
                <div className='text-[10px] font-medium uppercase'>
                  {t('duration')}
                </div>
                <div className='text-xs font-semibold text-foreground'>
                  {durationStr}
                </div>
              </div>
            </span>
            <span className='flex items-center gap-1.5'>
              <MapPin className='h-3.5 w-3.5 shrink-0' />
              <div>
                <div className='text-[10px] font-medium uppercase'>
                  {t('modality')}
                </div>
                <div className='text-xs font-semibold text-foreground'>
                  {modality}
                </div>
              </div>
            </span>
            <span className='flex items-center gap-1.5'>
              <Calendar className='h-3.5 w-3.5 shrink-0' />
              <div>
                <div className='text-[10px] font-medium uppercase'>
                  {t('start')}
                </div>
                <div className='text-xs font-semibold text-foreground'>
                  {startDateFormatted}
                </div>
              </div>
            </span>
          </div>
          {status === 'pending' && missionId && viewRole === 'professional' && (
            <div className='flex justify-end gap-1.5 border-t border-gray-100 pt-2'>
              <Button
                className='flex-1 rounded-full text-xs'
                disabled={acceptMission.isPending || declineMission.isPending}
                onClick={handleDecline}
                size='sm'
                variant='outline'
              >
                {t('declineMission')}
              </Button>
              <Button
                className='flex-1 rounded-full text-xs shadow-lg'
                disabled={acceptMission.isPending || declineMission.isPending}
                onClick={handleAccept}
                size='sm'
              >
                {t('acceptMission')}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function parseDate(value: null | string | undefined): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}
