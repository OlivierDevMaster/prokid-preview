'use client';

import {
  differenceInMonths,
  differenceInWeeks,
  format,
  isValid,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, ClipboardList, MapPin, Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { MissionRow } from '../types/chat.types';

const MOCK_DESCRIPTION =
  "Migration d'une architecture monolithique vers des microservices avec React et Node.js. Optimisation SEO et performance.";
const MOCK_MODALITY = 'Remote';
const MOCK_START_DATE = '2023-10-12';
const MOCK_DURATION_MONTHS = 3;

export interface MissionCardProps {
  mission: Partial<
    Pick<
      MissionRow,
      'description' | 'mission_dtstart' | 'mission_until' | 'title'
    >
  >;
}

export function MissionCard({ mission }: MissionCardProps) {
  const t = useTranslations('chat');

  const title = mission?.title ?? 'Bloc Mission: Développement Web Fullstack';
  const description = mission?.description ?? MOCK_DESCRIPTION;
  const startDate = mission?.mission_dtstart ?? MOCK_START_DATE;
  const startDateFormatted = (() => {
    const d = parseDate(startDate);
    return d ? format(d, 'd MMM. yyyy', { locale: fr }) : '12 Oct. 2023';
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
    return t('durationMonths', { count: MOCK_DURATION_MONTHS });
  })();

  const modality = MOCK_MODALITY;

  return (
    <Card className='rounded-2xl border bg-white shadow-sm'>
      <CardHeader className='space-y-0 pb-2'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-2'>
            <ClipboardList className='h-5 w-5 shrink-0 text-primary' />
            <CardTitle className='truncate font-bold text-primary'>
              {title}
            </CardTitle>
          </div>
          <span
            aria-label={t('missionStatusActive')}
            className='shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary'
          >
            {t('missionStatusActive').toUpperCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className='space-y-3 pt-0'>
        <p className='text-sm text-muted-foreground'>{description}</p>
        <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-gray-100 pt-2 text-muted-foreground'>
          <span className='flex items-center gap-2'>
            <Timer className='h-4 w-4 shrink-0' />
            <div>
              <div className='text-[11px] font-medium uppercase'>
                {t('duration')}
              </div>
              <div className='text-sm font-semibold text-foreground'>
                {durationStr}
              </div>
            </div>
          </span>
          <span className='flex items-center gap-2'>
            <MapPin className='h-4 w-4 shrink-0' />
            <div>
              <div className='text-[11px] font-medium uppercase'>
                {t('modality')}
              </div>
              <div className='text-smfont-semibold text-foreground'>
                {modality}
              </div>
            </div>
          </span>
          <span className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 shrink-0' />
            <div>
              <div className='text-[11px] font-medium uppercase'>
                {t('start')}
              </div>
              <div className='text-sm font-semibold text-foreground'>
                {startDateFormatted}
              </div>
            </div>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function parseDate(value: null | string | undefined): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}
