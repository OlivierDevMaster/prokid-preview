'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarDays, MessageCircle, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { StructureMission } from '@/features/structure/missions/modeles/mission.modele';

import {
  getMissionStatusConfig,
  type MissionStatus,
} from '@/features/missions/mission.model';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface StructureMissionCardProps {
  mission: StructureMission;
  onClick?: (missionId: string) => void;
}

export function StructureMissionCard({
  mission,
  onClick,
}: StructureMissionCardProps) {
  const t = useTranslations('structure.missions');
  const locale = (useLocale() as 'en' | 'fr') || 'en';

  const statusConfig = getMissionStatusConfig(locale);
  const status =
    statusConfig[mission.status as MissionStatus] || statusConfig.pending;

  const professionalName = mission.professional?.profile
    ? `${mission.professional.profile.first_name || ''} ${mission.professional.profile.last_name || ''}`.trim() ||
      mission.professional.profile.email ||
      t('unknownProfessional')
    : t('unknownProfessional');

  const periodLabel =
    mission.mission_dtstart && mission.mission_until
      ? `${format(new Date(mission.mission_dtstart), 'd MMM', { locale: fr })} - ${format(new Date(mission.mission_until), 'd MMM', { locale: fr })}`
      : '';

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center'>
      <div className='flex-1'>
        <div className='mb-2 flex flex-wrap items-center gap-3'>
          <h3 className='text-lg font-bold text-slate-900'>{mission.title}</h3>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold',
              status.bgColor,
              status.textColor
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', status.dotColor)} />
            {status.label}
          </span>
        </div>
        <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500'>
          <span className='flex items-center gap-1.5'>
            <User className='h-4 w-4' />
            <span className='font-medium text-slate-700'>{professionalName}</span>
          </span>
          {periodLabel && (
            <span className='flex items-center gap-1.5'>
              <CalendarDays className='h-4 w-4' />
              {periodLabel}
            </span>
          )}
        </div>
      </div>
      <div className='flex gap-2'>
        <button
          className='h-10 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200'
          onClick={() => onClick?.(mission.id)}
          type='button'
        >
          Voir la mission
        </button>
        <Link href='/structure/chat'>
          <span
            className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white'
          >
            <MessageCircle className='h-5 w-5' />
          </span>
        </Link>
      </div>
    </div>
  );
}
