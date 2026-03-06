import type { MissionStatus } from '../types/chat.types';

export const MISSION_STATUS_CONFIG: Record<
  MissionStatus,
  { className: string; labelKey: string }
> = {
  accepted: {
    className:
      'shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary',
    labelKey: 'missionStatusActive',
  },
  cancelled: {
    className:
      'shrink-0 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
    labelKey: 'statusCancelled',
  },
  declined: {
    className:
      'rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700',
    labelKey: 'missionStatusDeclined',
  },
  ended: {
    className:
      'shrink-0 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
    labelKey: 'statusEnded',
  },
  expired: {
    className:
      'shrink-0 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
    labelKey: 'statusExpired',
  },
  pending: {
    className:
      'rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800',
    labelKey: 'missionStatusPending',
  },
};

export function getMissionStatusConfig(status: MissionStatus) {
  return MISSION_STATUS_CONFIG[status] ?? MISSION_STATUS_CONFIG.pending;
}
