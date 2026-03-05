import { Info, Mail, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';
import { useSelectedProfessional } from '@/shared/stores/useSelectedProfessional';

export function RecapPropositionCard() {
  const t = useTranslations('structure.missions.proposition');
  const { selectedProfessionalIds } = useSelectedProfessional();
  const selectedCount = selectedProfessionalIds.size;

  return (
    <Card className='rounded-3xl border-none bg-blue-900 text-white shadow-lg'>
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
          <div className='flex items-center justify-between'>
            <p className='text-sm text-blue-100'>{t('recapFieldTitle')}</p>
            <p className='text-sm font-semibold'>Jean Dupont</p>
          </div>
        </div>
        <div className='flex items-center justify-between border-t border-white/25 pt-4'>
          <p className='text-sm text-blue-100'>{t('recapFieldDuration')}</p>
          <p className='text-sm font-semibold'>
            {`10 ${t('durationUnitDays')}`}
          </p>
        </div>

        <div className='flex items-center justify-between border-t border-white/25 pt-4'>
          <p className='text-sm text-blue-100'>{t('recapFieldLocation')}</p>
          <p className='text-sm font-semibold'>Paris</p>
        </div>

        {/* Actions */}
        <div className='mt-3 space-y-3 pt-1'>
          <button className='flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-blue-200'>
            <Send className='h-4 w-4' />
            <span className='text-sm font-semibold'>{t('actionSend')}</span>
          </button>

          <button className='flex w-full items-center justify-center gap-2 rounded-full border border-white/50 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/20 hover:text-white'>
            <Mail className='h-4 w-4' />
            <span className='text-sm font-semibold'>
              {t('actionSaveDraft')}
            </span>
          </button>
        </div>
      </div>
    </Card>
  );
}
