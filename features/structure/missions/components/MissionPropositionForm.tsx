'use client';

import {
  CalendarDays,
  Clock3,
  FileText,
  Info,
  MapPin,
  Type,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputDate } from '@/components/ui/input-date';
import { Textarea } from '@/components/ui/textarea';

import { RecapPropositionCard } from './RecapPropositionCard';
export function MissionPropositionForm() {
  const t = useTranslations('structure.missions.proposition');
  const [durationMode, setDurationMode] = useState<'duration' | 'period'>(
    'duration'
  );

  const selectDuration = () => {
    setDurationMode('duration');
  };

  const selectPeriod = () => {
    setDurationMode('period');
  };

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row'>
        {/* Main form column */}
        <div className='flex-1 space-y-6'>
          {/* 1. Titre de la mission */}
          <Card className='border-none bg-white shadow-sm'>
            <div className='px-4 py-3 sm:px-6'>
              <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                  <Type className='h-4 w-4 text-blue-600' />
                </span>
                <span>1. {t('missionSectionTitle')}</span>
              </h2>
            </div>

            <div className='space-y-2 px-4 py-5'>
              <Input
                className='rounded-xl border border-blue-100 bg-blue-50/40 text-sm placeholder:text-gray-400'
                id='mission-title'
                placeholder={t('missionSectionPlaceholder')}
              />
            </div>
          </Card>

          {/* 2. Description / Contexte */}
          <Card className='border-none bg-white shadow-sm'>
            <div className='space-y-4 px-4 py-3 sm:px-6 sm:py-6'>
              <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                  <FileText className='h-4 w-4 text-blue-600' />
                </span>
                <span>2. {t('descriptionSectionTitle')}</span>
              </h2>
              <p className='mt-1 text-sm font-medium text-gray-500'>
                {t('descriptionHelper')}
              </p>
              <Textarea
                className='min-h-[180px] resize-y rounded-2xl border border-blue-100 bg-blue-50/40 text-sm placeholder:text-gray-400'
                id='mission-description'
                placeholder={t('descriptionPlaceholder')}
              />
            </div>
          </Card>

          {/* 2. Durée / Période */}
          <Card className='border-none bg-white shadow-sm'>
            <div className='px-4 py-3 sm:px-6'>
              <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                  <Clock3 className='h-4 w-4 text-blue-600' />
                </span>
                <span>3. {t('durationSectionTitle')}</span>
              </h2>
              <p className='mt-4 text-sm font-medium text-gray-500 sm:text-sm'>
                {t('durationHelper')}
              </p>
            </div>

            <div className='space-y-4 px-4 pb-4 pt-2 sm:px-6 sm:pb-6'>
              <div className='flex flex-wrap items-center gap-3'>
                <div className='inline-flex rounded-full bg-gray-100 p-1 text-sm font-medium text-gray-600'>
                  <button
                    className={`rounded-full px-5 py-2 transition ${
                      durationMode === 'duration'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600'
                    }`}
                    onClick={selectDuration}
                    type='button'
                  >
                    {t('durationTab')}
                  </button>
                  <button
                    className={`rounded-full px-5 py-2 transition ${
                      durationMode === 'period'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600'
                    }`}
                    onClick={selectPeriod}
                    type='button'
                  >
                    {t('periodTab')}
                  </button>
                </div>
              </div>

              {durationMode === 'duration' ? (
                <div className='space-y-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 sm:p-4'>
                  <div className='flex items-center gap-2 text-blue-600'>
                    <Info className='h-3.5 w-3.5' />
                    <p className='text-xs'>{t('durationInfo')}</p>
                  </div>
                  <div className='mt-2 grid grid-cols-[minmax(0,1fr),auto] items-end gap-3'>
                    <div className='flex space-x-2'>
                      <Input
                        className='w-full max-w-[140px] rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-gray-400'
                        id='mission-duration'
                        min={1}
                        placeholder='10'
                        type='number'
                      />
                      <div className='rounded-xl bg-gray-100 px-4 py-3 text-xs font-medium text-gray-900'>
                        {t('durationUnitDays')}
                      </div>
                    </div>
                    <div className='space-y-1.5'></div>
                  </div>
                </div>
              ) : (
                <div className='space-y-2 rounded-lg border border-dashed border-gray-200 p-3'>
                  <div className='flex items-center gap-2 text-blue-600'>
                    <Info className='h-3.5 w-3.5' />
                    <p className='text-xs'>{t('periodInfo')}</p>
                  </div>
                  <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                    <div className='space-y-1.5'>
                      <label
                        className='text-xs font-medium text-gray-700'
                        htmlFor='period-start'
                      >
                        {t('periodStartLabel')}
                      </label>
                      <InputDate id='period-start' />
                    </div>
                    <div className='space-y-1.5'>
                      <label
                        className='text-xs font-medium text-gray-700'
                        htmlFor='period-end'
                      >
                        {t('periodEndLabel')}
                      </label>
                      <InputDate id='period-end' />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 3. Localisation / Modalités */}
          <Card className='border-none bg-white shadow-sm'>
            <div className='px-4 py-3 sm:px-6'>
              <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                  <MapPin className='h-4 w-4 text-blue-600' />
                </span>
                    <span>4. {t('locationSectionTitle')}</span>
              </h2>
            </div>

            <div className='space-y-3 px-4 py-4'>
              <p className='text-sm font-medium text-gray-500'>
                {t('locationHelper')}
              </p>
              <Input
                className='rounded-xl border border-blue-100 bg-blue-50/40 text-sm placeholder:text-gray-400'
                id='mission-city'
                placeholder={t('cityPlaceholder')}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className='w-full max-w-sm space-y-4 lg:sticky lg:top-6 lg:self-start'>
          {/* 4. Début souhaité */}
          <Card className='border-none bg-white shadow-sm'>
            <div className='px-4 py-3 sm:px-6'>
              <h2 className='flex items-center gap-3 text-base font-semibold text-gray-900 sm:text-lg'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-50'>
                  <CalendarDays className='h-4 w-4 text-blue-600' />
                </span>
                <span>5. {t('desiredStartSectionTitle')}</span>
              </h2>
            </div>
            <div className='px-4 py-2 sm:px-6 sm:py-5'>
              <div className='space-y-1.5'>
                <label
                  className='text-sm font-medium text-gray-500'
                  htmlFor='desired-start-date'
                >
                  {t('desiredStartLabel')}
                </label>
                <div className='relative'>
                  <InputDate fullWidth id='desired-start-date' />
                </div>
              </div>
            </div>
          </Card>

          {/* Recap card */}
          <RecapPropositionCard />
        </div>
      </div>
    </div>
  );
}
