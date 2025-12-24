'use client';

import { format } from 'date-fns';
import { Calendar, FileText, Mail, MapPin, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMissionDuration } from '@/features/mission-durations';
import { MissionStatusLabel } from '@/features/missions/mission.model';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import type { StructureMission } from '../modeles/mission.modele';

import { useLastReportForMission } from '../hooks/useLastReportForMission';

interface MissionDetailsContentProps {
  locale: 'en' | 'fr';
  mission: StructureMission;
  onClose: () => void;
  t: (key: string) => string;
}

interface MissionDetailsDialogProps {
  isLoading: boolean;
  mission: null | StructureMission;
  onClose: () => void;
  open: boolean;
}

export function MissionDetailsDialog({
  isLoading,
  mission,
  onClose,
  open,
}: MissionDetailsDialogProps) {
  const t = useTranslations('structure.missions');
  const locale = (useLocale() as 'en' | 'fr') || 'en';

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col'>
        {isLoading ? (
          <div className='py-8 text-center text-gray-600'>{t('loading')}</div>
        ) : mission ? (
          <MissionDetailsContent
            locale={locale}
            mission={mission}
            onClose={onClose}
            t={t}
          />
        ) : (
          <div className='py-8 text-center text-gray-600'>
            {t('noMissions')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MissionDetailsContent({
  locale,
  mission,
  onClose,
  t,
}: MissionDetailsContentProps) {
  const { data: missionDuration, isLoading: isLoadingDuration } =
    useMissionDuration(mission.id);

  const { data: lastReport, isLoading: isLoadingLastReport } =
    useLastReportForMission(mission.id);

  const progressPercentage = missionDuration?.percentage ?? 0;
  const pastDurationHours = missionDuration?.past_duration_mn
    ? Math.round(missionDuration.past_duration_mn / 60)
    : 0;
  const totalDurationHours = missionDuration?.total_duration_mn
    ? Math.round(missionDuration.total_duration_mn / 60)
    : 0;

  const statusConfig = {
    accepted: {
      bgColor: 'bg-green-50',
      dotColor: 'bg-green-500',
      label: MissionStatusLabel[locale].accepted,
      textColor: 'text-green-700',
    },
    cancelled: {
      bgColor: 'bg-gray-50',
      dotColor: 'bg-gray-500',
      label: MissionStatusLabel[locale].cancelled,
      textColor: 'text-gray-700',
    },
    declined: {
      bgColor: 'bg-red-50',
      dotColor: 'bg-red-500',
      label: MissionStatusLabel[locale].declined,
      textColor: 'text-red-700',
    },
    ended: {
      bgColor: 'bg-blue-50',
      dotColor: 'bg-blue-500',
      label: MissionStatusLabel[locale].ended,
      textColor: 'text-blue-700',
    },
    expired: {
      bgColor: 'bg-orange-50',
      dotColor: 'bg-orange-500',
      label: MissionStatusLabel[locale].expired,
      textColor: 'text-orange-700',
    },
    pending: {
      bgColor: 'bg-yellow-50',
      dotColor: 'bg-yellow-500',
      label: MissionStatusLabel[locale].pending,
      textColor: 'text-yellow-700',
    },
  };

  const status = statusConfig[mission.status] || statusConfig.pending;

  const professionalName = mission.professional?.profile
    ? `${mission.professional.profile.first_name || ''} ${mission.professional.profile.last_name || ''}`.trim() ||
      mission.professional.profile.email ||
      t('unknownProfessional')
    : t('unknownProfessional');

  const professionalEmail = mission.professional?.profile?.email;

  return (
    <>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-3'>
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-200'>
            <User className='h-5 w-5 text-white' />
          </div>
          <span>{mission.title}</span>
        </DialogTitle>
        <DialogDescription>{mission.description || ''}</DialogDescription>
        <div
          className={cn(
            'mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1',
            status.bgColor,
            status.textColor
          )}
        >
          <div className={cn('h-2 w-2 rounded-full', status.dotColor)} />
          <span className='text-xs font-medium'>{status.label}</span>
        </div>
      </DialogHeader>

      <div className='my-4 max-h-[60vh] space-y-4 overflow-y-auto px-1'>
        {/* Professional Information */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <h3 className='mb-3 text-sm font-semibold text-gray-700'>
            Professional
          </h3>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <MapPin className='h-4 w-4 text-gray-400' />
              <span>{professionalName}</span>
            </div>
            {professionalEmail && (
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <Mail className='h-4 w-4 text-gray-400' />
                <span>{professionalEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mission Description */}
        {mission.description && (
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
            <h3 className='mb-2 text-sm font-semibold text-gray-700'>
              {t('descriptionLabel')}
            </h3>
            <p className='text-sm text-gray-600'>{mission.description}</p>
          </div>
        )}

        {/* Duration Progress */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <h3 className='mb-3 text-sm font-semibold text-gray-700'>
            {t('hoursCompleted')}
          </h3>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <div className='h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100'>
                <div className='flex h-full'>
                  <div
                    className='h-full bg-blue-500'
                    style={{ width: `${progressPercentage}%` }}
                  />
                  <div
                    className='h-full bg-green-200'
                    style={{ width: `${100 - progressPercentage}%` }}
                  />
                </div>
              </div>
              <span className='whitespace-nowrap text-sm font-medium text-gray-700'>
                {isLoadingDuration
                  ? 'xh / xh'
                  : `${pastDurationHours}h / ${totalDurationHours}h`}
              </span>
            </div>
          </div>
        </div>

        {/* Period */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <Calendar className='h-4 w-4 text-gray-400' />
            <span>
              {t('period')}:{' '}
              {format(new Date(mission.mission_dtstart), 'dd/MM/yyyy')} -{' '}
              {format(new Date(mission.mission_until), 'dd/MM/yyyy')}
            </span>
          </div>
        </div>

        {/* Last Report */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <h3 className='mb-2 text-sm font-semibold text-gray-700'>
            {t('lastReport')}
          </h3>
          <div className='space-y-1'>
            {isLoadingLastReport ? (
              <div className='text-sm text-gray-600'>...</div>
            ) : lastReport ? (
              <>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <FileText className='h-4 w-4 text-gray-400' />
                  <span className='font-medium'>{lastReport.title}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                  <Calendar className='h-4 w-4 text-gray-400' />
                  <span>
                    {format(new Date(lastReport.created_at), 'dd/MM/yyyy')}
                  </span>
                </div>
              </>
            ) : (
              <div className='text-sm text-gray-500'>{t('noReport')}</div>
            )}
          </div>
        </div>

        {/* View Reports Link */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
          <Link
            className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline'
            href={`/structure/reports?mission=${mission.id}`}
          >
            <FileText className='h-4 w-4' />
            <span>{t('viewReports')}</span>
          </Link>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onClose} variant='outline'>
          {t('close')}
        </Button>
      </DialogFooter>
    </>
  );
}
