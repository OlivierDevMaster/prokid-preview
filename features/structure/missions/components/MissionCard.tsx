'use client';

import { format } from 'date-fns';
import { Clock, FileText, MapPin, Phone, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MissionStatusLabel } from '@/features/missions/mission.model';
import { cn } from '@/lib/utils';

import type { StructureMission } from '../modeles/mission.modele';

interface MissionCardProps {
  mission: StructureMission;
  onViewDetails?: (id: string) => void;
}

export function MissionCard({ mission, onViewDetails }: MissionCardProps) {
  const t = useTranslations('structure.missions');
  const locale = (useLocale() as 'en' | 'fr') || 'en';

  // Calculate progress percentage (placeholder - you may want to calculate based on actual hours)
  const progressPercentage = 60;

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
    <Card className='rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md'>
      <div className='p-6'>
        {/* Header */}
        <div className='mb-4 flex items-start justify-between'>
          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-200'>
              <User className='h-6 w-6 text-white' />
            </div>
            <div>
              <h3 className='mb-1 text-lg font-bold text-gray-900'>
                {mission.title}
              </h3>
              <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                <MapPin className='h-4 w-4 text-gray-400' />
                <span>{professionalName}</span>
              </div>
            </div>
          </div>
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

        {/* Details */}
        <div className='mb-4 space-y-3'>
          {professionalEmail && (
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Phone className='h-4 w-4 text-gray-400' />
              <span>{professionalEmail}</span>
            </div>
          )}

          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Clock className='h-4 w-4 text-gray-400' />
              <span>{t('hoursCompleted')}</span>
            </div>
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
            </div>
          </div>

          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <FileText className='h-4 w-4 text-gray-400' />
            <span>{t('lastReport')}</span>
            <span className='text-gray-500'>
              {mission.updated_at
                ? format(new Date(mission.updated_at), 'dd/MM/yyyy')
                : t('noReport')}
            </span>
          </div>

          <div className='text-xs text-gray-500'>
            {t('period')}:{' '}
            {format(new Date(mission.mission_dtstart), 'dd/MM/yyyy')} -{' '}
            {format(new Date(mission.mission_until), 'dd/MM/yyyy')}
          </div>
        </div>

        {/* Action Button */}
        <Button
          className='w-full border-gray-300 text-gray-700 hover:bg-gray-50'
          onClick={() => onViewDetails?.(mission.id)}
          variant='outline'
        >
          {t('viewDetails')}
        </Button>
      </div>
    </Card>
  );
}
