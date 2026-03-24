'use client';

import { useTranslations } from 'next-intl';

import type { MissionStatus } from '../types/chat.types';

import { getMissionStatusConfig } from '../utils/missionStatus.config';

export interface MissionStatusBadgeProps {
  /** If true, render smaller (e.g. for conversation list). Default: false */
  compact?: boolean;
  status: MissionStatus;
}

export function MissionStatusBadge({
  compact = false,
  status,
}: MissionStatusBadgeProps) {
  const t = useTranslations('chat');
  const config = getMissionStatusConfig(status);
  const label = t(config.labelKey);

  return (
    <span
      aria-label={label}
      className={compact ? `${config.className} text-[10px]` : config.className}
    >
      {label.toUpperCase()}
    </span>
  );
}
