'use client';

import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

import { useRecentMissionsBetween } from '@/features/chat/hooks/useRecentMissionsBetween';

import type { MissionStatus } from '../types/chat.types';

import { MissionStatusBadge } from './MissionStatusBadge';

export interface MissionHistorySectionProps {
  professionalId: null | string;
  structureId: null | string;
}

export function MissionHistorySection({
  professionalId,
  structureId,
}: MissionHistorySectionProps) {
  const t = useTranslations('chat');
  const { data: missions, isLoading } = useRecentMissionsBetween(
    structureId,
    professionalId
  );

  return (
    <section className='mb-4'>
      <h4 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        {t('missionHistory')}
      </h4>
      {isLoading ? (
        <p className='text-sm text-muted-foreground'>
          {t('missionHistoryEmpty')}
        </p>
      ) : missions.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          {t('missionHistoryEmpty')}
        </p>
      ) : (
        <ul className='space-y-2'>
          {missions.map(mission => (
            <li
              className='flex flex-col gap-1 rounded-md bg-white px-3 py-2'
              key={mission.id}
            >
              <span className='truncate text-sm font-medium'>
                {mission.title}
              </span>
              <div className='flex flex-wrap items-center gap-2'>
                <MissionStatusBadge
                  compact
                  status={mission.status as MissionStatus}
                />
                <span className='text-xs text-muted-foreground'>
                  {format(new Date(mission.mission_dtstart), 'dd MMM yyyy')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
