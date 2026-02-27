'use client';

import { format } from 'date-fns';
import { ChevronRight, MapPin } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  getMissionStatusConfig,
  type MissionWithStructure,
} from '@/features/missions/mission.model';
import { cn } from '@/lib/utils';
import {
  AVATAR_COLOR_VARIANTS,
  getAvatarColorVariantIndex,
} from '@/shared/utils/avatar-colors';
import { extractInitials } from '@/shared/utils/extract-initials';

interface ProfessionalMissionCardProps {
  mission: MissionWithStructure;
  onViewDetails?: (id: string) => void;
}

export function ProfessionalMissionCard({
  mission,
  onViewDetails,
}: ProfessionalMissionCardProps) {
  const t = useTranslations('professional.missions');
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

  const initials = extractInitials( mission.title);

  const colorIndex = getAvatarColorVariantIndex(mission.title);
  const avatarColors = AVATAR_COLOR_VARIANTS[colorIndex];

  return (
    <div
      className='flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100'
      onClick={() => onViewDetails?.(mission.id)}
    >
      {/* Circle with initials */}
      <div
        className={cn(
          'relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
          avatarColors.bg
        )}
      >
        <span className={cn('text-sm font-semibold', avatarColors.text)}>
          {initials}
        </span>
      </div>

      {/* Mission details */}
      <div className='flex flex-1 flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <h3 className='font-bold text-gray-900'>{mission.title}</h3>
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1',
              status.bgColor,
              status.textColor
            )}
          >
            <div className={cn('h-2 w-2 rounded-full', status.dotColor)} />
            <span className='text-xs font-medium'>{status.label}</span>
          </div>
        </div>
        <div className='flex items-center gap-1.5 text-sm text-gray-600'>
          <MapPin className='h-4 w-4 text-gray-400' />
          <span>{structureName}</span>
        </div>
        <p className='text-sm text-gray-600'>
          {t('period')}:{' '}
          {format(new Date(mission.mission_dtstart), 'dd/MM/yyyy')} -{' '}
          {format(new Date(mission.mission_until), 'dd/MM/yyyy')}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight className='h-5 w-5 text-gray-400' />
    </div>
  );
}
