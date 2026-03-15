import { format } from 'date-fns';
import { Info, Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';
import { getDurationInDays } from '@/shared/utils/date';

type RecapPropositionCardProps = {
  address: string;
  desiredStartDate?: Date;
  durationDays: string;
  errorMessage?: null | string;
  isPeriodMode?: boolean;
  isSubmitting?: boolean;
  periodEndDate?: Date;
  periodStartDate?: Date;
  title: string;
};

export function RecapPropositionCard({
  address,
  desiredStartDate,
  durationDays,
  errorMessage,
  isPeriodMode,
  isSubmitting,
  periodEndDate,
  periodStartDate,
  title,
}: RecapPropositionCardProps) {
  const t = useTranslations('structure.missions.proposition');
  const period = useTranslations('structure.missions');
  const { selectedProfessionalIds } = useSelectedProfessional();
  const selectedCount = selectedProfessionalIds.size;

  const formattedDesiredStartDate = desiredStartDate
    ? format(desiredStartDate, 'dd/MM/yyyy')
    : '';

  const hasPeriod =
    isPeriodMode && periodStartDate && periodEndDate ? true : false;

  const formattedPeriod =
    periodStartDate && periodEndDate
      ? `${format(periodStartDate, 'dd/MM/yyyy')} - ${format(periodEndDate, 'dd/MM/yyyy')}`
      : '';

  const periodDurationDays =
    periodStartDate && periodEndDate
      ? getDurationInDays(periodStartDate, periodEndDate)
      : null;

  return (
    <Card className='rounded-3xl border-none bg-blue-900 px-4 py-4 text-white shadow-lg'>
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
        <div className='border-white/25 pt-2'>
          {/* Title */}
          <div className='flex items-center justify-between'>
            <p className='text-sm text-blue-100'>{t('recapFieldTitle')}</p>
            <p className='text-sm font-semibold'>{title || ''}</p>
          </div>
        </div>
        {/* Duration */}
        <div className='flex items-center justify-between border-t border-white/25 pt-4'>
          <p className='text-sm text-blue-100'>{t('recapFieldDuration')}</p>
          <p className='text-sm font-semibold'>
            {hasPeriod && periodDurationDays
              ? `${periodDurationDays} ${t('durationUnitDays')}`
              : durationDays
                ? `${durationDays} ${t('durationUnitDays')}`
                : ''}
          </p>
        </div>
        {/* Location */}
        <div className='flex items-center justify-between border-t border-white/25 pt-4'>
          <p className='text-sm text-blue-100'>{t('recapFieldLocation')}</p>
          <p className='text-sm font-semibold'>{address || ''}</p>
        </div>

        {/* Date / Period */}
        <div className='flex items-center justify-between border-t border-white/25 pt-4'>
          <p className='text-sm text-blue-100'>
            {hasPeriod ? period('period') : t('desiredStartLabel')}
          </p>
          <p className='text-sm font-semibold'>
            {hasPeriod ? formattedPeriod : formattedDesiredStartDate || ''}
          </p>
        </div>

        {/* Actions */}
        <div className='mt-3 space-y-3 pt-1'>
          {errorMessage && (
            <p className='text-sm font-medium text-red-200' role='alert'>
              {errorMessage}
            </p>
          )}
          <button
            className='flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-70'
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
