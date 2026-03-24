'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronRight, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { StructureMission } from '@/features/structure/missions/modeles/mission.modele';

import {
  getMissionStatusConfig,
  type MissionStatus,
} from '@/features/missions/mission.model';
import { cn } from '@/lib/utils';
import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';
import { extractInitials } from '@/shared/utils/extract-initials';

interface StructureMissionCardProps {
  mission: StructureMission;
  onClick?: (missionId: string) => void;
}

export function StructureMissionCard({
  mission,
  onClick,
}: StructureMissionCardProps) {
  const t = useTranslations('structure.missions');
  const tStatus = useTranslations('professional.dashboard');
  const locale = (useLocale() as 'en' | 'fr') || 'en';

  const statusConfig = getMissionStatusConfig(locale);
  const status =
    statusConfig[mission.status as MissionStatus] || statusConfig.pending;

  const professionalName = mission.professional?.profile
    ? `${mission.professional.profile.first_name || ''} ${mission.professional.profile.last_name || ''}`.trim() ||
      mission.professional.profile.email ||
      t('unknownProfessional')
    : t('unknownProfessional');

  const initials = extractInitials(mission.title);

  const period =
    mission.mission_dtstart && mission.mission_until
      ? `${format(new Date(mission.mission_dtstart), 'd MMM', { locale: fr })} - ${format(new Date(mission.mission_until), 'd MMM', { locale: fr })}`
      : '';

  const isProfessionalAvailable = !!mission.professional?.is_available;

  const colorIndex = getAvatarColorVariantIndex(
    professionalName || mission.title
  );
  const avatarColors = AVATAR_COLOR_VARIANTS[colorIndex];

  console.log(avatarColors.bg);

  return (
    <button
      className='flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md'
      onClick={() => onClick?.(mission.id)}
      type='button'
    >
      {/* Avatar / initials */}
      <div
        className={cn(
          'relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
          avatarColors.bg
        )}
      >
        <span className={cn('text-sm font-semibold', avatarColors.text)}>
          {initials || <User className='h-5 w-5 text-blue-600' />}
        </span>
        {/* Availability status dot (green when professional is available) */}
        <span
          aria-label={
            isProfessionalAvailable
              ? tStatus('availableStatus')
              : tStatus('unavailableStatus')
          }
          className={cn(
            'absolute -right-0.5 bottom-0 h-3 w-3 rounded-full border-2 border-white',
            isProfessionalAvailable ? 'bg-emerald-400' : 'bg-gray-300'
          )}
          title={
            isProfessionalAvailable
              ? tStatus('availableStatus')
              : tStatus('unavailableStatus')
          }
        />
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <h3 className='truncate text-sm font-semibold text-gray-900'>
            {mission.title}
          </h3>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
              status.bgColor,
              status.textColor
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', status.dotColor)} />
            <span>{status.label}</span>
          </div>
        </div>
        <p className='truncate text-xs text-gray-600'>{professionalName}</p>
        {period && (
          <p className='text-xs text-gray-500'>
            {t('period')}: {period}
          </p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className='h-4 w-4 flex-shrink-0 text-gray-400' />
    </button>
  );
}
