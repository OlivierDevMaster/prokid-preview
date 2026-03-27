import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Info, Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

import type { DaySchedule } from '../validation/mission.schema';

type MissionModality = 'hybrid' | 'on_site' | 'remote';

type RecapPropositionCardProps = {
  address: string;
  dailyEndTime?: string;
  dailyStartTime?: string;
  daySchedules?: DaySchedule[];
  endDate?: Date;
  errorMessage?: null | string;
  isSubmitting?: boolean;
  modality: MissionModality;
  sameHoursEveryDay: boolean;
  startDate?: Date;
  title: string;
};

const modalityLabelKey: Record<MissionModality, string> = {
  hybrid: 'modalityHybrid',
  on_site: 'modalityOnSite',
  remote: 'modalityRemote',
};

export function RecapPropositionCard({
  address,
  dailyEndTime,
  dailyStartTime,
  daySchedules,
  endDate,
  errorMessage,
  isSubmitting,
  modality,
  sameHoursEveryDay,
  startDate,
  title,
}: RecapPropositionCardProps) {
  const t = useTranslations('structure.missions.proposition');
  const { selectedProfessionalIds } = useSelectedProfessional();
  const selectedCount = selectedProfessionalIds.size;

  const formattedPeriod =
    startDate && endDate
      ? startDate.toDateString() === endDate.toDateString()
        ? format(startDate, 'dd/MM/yyyy')
        : `${format(startDate, 'dd/MM/yyyy')} → ${format(endDate, 'dd/MM/yyyy')}`
      : '';

  const scheduleLabel = sameHoursEveryDay
    ? dailyStartTime && dailyEndTime
      ? `${dailyStartTime} - ${dailyEndTime}`
      : ''
    : t('recapScheduleVariable');

  return (
    <Card className='rounded-3xl border-none bg-[#2C3E50] px-4 py-4 text-white shadow-lg'>
      {/* Header */}
      <div className='flex items-center gap-2 px-5 py-4'>
        <span className='flex h-6 w-6 items-center justify-center rounded-full bg-white/20'>
          <Info className='h-3.5 w-3.5 text-white' />
        </span>
        <h2 className='text-sm font-semibold sm:text-base'>
          {t('recapTitle')}
        </h2>
      </div>

      {/* Rows */}
      <div className='space-y-4 px-5 pb-5 text-sm'>
        <p className='mt-1 text-sm text-blue-100'>
          {t('recapSentToProfessionals', { count: selectedCount })}
        </p>

        {/* Title */}
        <div className='border-white/25 pt-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-blue-100'>{t('recapFieldTitle')}</p>
            <p className='text-sm font-semibold'>{title || ''}</p>
          </div>
        </div>

        {/* Period */}
        <div className='flex items-center justify-between border-t border-white/25 pt-4'>
          <p className='text-sm text-blue-100'>{t('recapFieldPeriod')}</p>
          <p className='text-sm font-semibold'>{formattedPeriod}</p>
        </div>

        {/* Schedule */}
        <div className='flex flex-col gap-1 border-t border-white/25 pt-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-blue-100'>{t('recapFieldSchedule')}</p>
            <p className='text-sm font-semibold'>{scheduleLabel}</p>
          </div>
          {!sameHoursEveryDay && daySchedules && daySchedules.length > 0 && (
            <div className='mt-2 space-y-1'>
              {daySchedules.slice(0, 5).map((day, i) => (
                <div
                  className='flex items-center justify-between text-xs text-blue-100'
                  key={i}
                >
                  <span>{format(day.date, 'EEE dd/MM', { locale: fr })}</span>
                  <span>
                    {day.startTime} - {day.endTime}
                  </span>
                </div>
              ))}
              {daySchedules.length > 5 && (
                <p className='text-xs text-blue-200'>
                  +{daySchedules.length - 5} jours...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Location / Modality */}
        <div className='flex flex-col gap-1 border-t border-white/25 pt-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-blue-100'>{t('recapFieldLocation')}</p>
            <p className='text-sm font-semibold'>
              {t(modalityLabelKey[modality])}
            </p>
          </div>
          {(modality === 'on_site' || modality === 'hybrid') && address && (
            <p className='text-right text-sm text-blue-100'>{address}</p>
          )}
        </div>

        {/* Actions */}
        <div className='mt-3 space-y-3 pt-1'>
          {errorMessage && (
            <p className='text-sm font-medium text-red-200' role='alert'>
              {errorMessage}
            </p>
          )}
          <button
            className='flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#2C3E50] shadow-sm transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-70'
            disabled={isSubmitting}
            type='submit'
          >
            {isSubmitting ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
            <span className='text-sm font-semibold'>{t('actionSend')}</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
