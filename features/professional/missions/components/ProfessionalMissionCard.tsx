'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Building2, CalendarDays, MessageCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  getMissionStatusConfig,
  type MissionWithStructure,
} from '@/features/missions/mission.model';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface ProfessionalMissionCardProps {
  mission: MissionWithStructure;
  onViewDetails?: (id: string) => void;
}

export function ProfessionalMissionCard({
  mission,
  onViewDetails,
}: ProfessionalMissionCardProps) {
  const t = useTranslations('professional.missions');
  const tDashboard = useTranslations('professional.dashboard');
  const locale = (useLocale() as 'en' | 'fr') || 'en';

  const statusConfig = getMissionStatusConfig(locale);
  const status = statusConfig[mission.status] || statusConfig.pending;

  const structureName =
    mission.structure?.name ||
    (mission.structure?.profile
      ? `${mission.structure.profile.first_name || ''} ${mission.structure.profile.last_name || ''}`.trim() ||
        mission.structure.profile.email ||
        t('unknownStructure')
      : t('unknownStructure'));

  const periodLabel =
    mission.mission_dtstart && mission.mission_until
      ? `${format(new Date(mission.mission_dtstart), 'd MMM', { locale: fr })} - ${format(new Date(mission.mission_until), 'd MMM', { locale: fr })}`
      : '';

  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center'>
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
            <Building2 className='h-4 w-4' />
            <span className='font-medium text-slate-700'>{structureName}</span>
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
          className='rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200'
          onClick={() => onViewDetails?.(mission.id)}
          type='button'
        >
          {tDashboard('viewMission')}
        </button>
        <Link href='/professional/chat'>
          <button
            className='rounded-lg bg-[#4A90E2]/10 p-2 text-[#4A90E2] transition-colors hover:bg-[#4A90E2] hover:text-white'
            type='button'
          >
            <MessageCircle className='h-5 w-5' />
          </button>
        </Link>
      </div>
    </div>
  );
}
