'use client';

import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFindMission } from '@/features/admin/missions/hooks/useFindMission';
import {
  MissionStatus,
  MissionStatusLabel,
} from '@/features/missions/mission.model';

export default function AdminMissionDetailsPage() {
  const { id } = useParams();
  const locale = useLocale();
  const t = useTranslations('admin.missions');
  const dateLocale = locale === 'fr' ? fr : enUS;

  const { data: mission, isLoading } = useFindMission(id as string);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {t('notFound')}
          </h1>
          <Link href='/admin/missions'>
            <Button>{t('backToList')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const structure = mission.structure;
  const professional = mission.professional;
  const structureName = structure?.name || 'N/A';
  const structureEmail = structure?.profile?.email || 'N/A';
  const professionalProfile = professional?.profile;
  const professionalName = professionalProfile
    ? `${professionalProfile.first_name || ''} ${professionalProfile.last_name || ''}`.trim()
    : 'N/A';
  const professionalEmail = professionalProfile?.email || 'N/A';
  const statusLabel =
    MissionStatusLabel[locale as 'en' | 'fr']?.[
      mission.status as keyof typeof MissionStatusLabel.en
    ] || mission.status;

  function getStatusBadgeClassName(status: string): string {
    const statusMap: Record<string, string> = {
      [MissionStatus.accepted]: 'bg-green-500 text-white',
      [MissionStatus.cancelled]: 'bg-gray-500 text-white',
      [MissionStatus.declined]: 'bg-red-500 text-white',
      [MissionStatus.ended]: 'bg-blue-500 text-white',
      [MissionStatus.expired]: 'bg-orange-500 text-white',
      [MissionStatus.pending]: 'bg-yellow-500 text-white',
    };

    return statusMap[status] || 'bg-gray-500 text-white';
  }

  return (
    <div className='min-h-screen space-y-6 overflow-hidden bg-blue-50/30 p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/admin/missions'>
            <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
          </Link>
          <h1 className='text-3xl font-bold text-gray-900'>{t('details')}</h1>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Mission Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('missionInformation')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('titleColumn')}
              </label>
              <p className='text-gray-900'>{mission.title}</p>
            </div>
            {mission.description && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('description')}
                </label>
                <p className='whitespace-pre-wrap text-gray-700'>
                  {mission.description}
                </p>
              </div>
            )}
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('status')}
              </label>
              <div className='mt-1'>
                <Badge
                  className={getStatusBadgeClassName(mission.status)}
                  variant='default'
                >
                  {statusLabel}
                </Badge>
              </div>
            </div>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('startDate')}
              </label>
              <p className='text-gray-900'>
                {format(new Date(mission.mission_dtstart), 'dd/MM/yyyy', {
                  locale: dateLocale,
                })}
              </p>
            </div>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('endDate')}
              </label>
              <p className='text-gray-900'>
                {format(new Date(mission.mission_until), 'dd/MM/yyyy', {
                  locale: dateLocale,
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Structure Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('structureInformation')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('structure')}
              </label>
              <p className='text-gray-900'>{structureName}</p>
            </div>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('email')}
              </label>
              <p className='text-gray-900'>{structureEmail}</p>
            </div>
            {structure && (
              <div>
                <Link
                  className='text-sm text-blue-600 hover:text-blue-800 hover:underline'
                  href={`/admin/structures/${structure.user_id}`}
                >
                  {t('viewStructure')}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('professionalInformation')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('professional')}
              </label>
              <p className='text-gray-900'>{professionalName}</p>
            </div>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('email')}
              </label>
              <p className='text-gray-900'>{professionalEmail}</p>
            </div>
            {professional && (
              <div>
                <Link
                  className='text-sm text-blue-600 hover:text-blue-800 hover:underline'
                  href={`/admin/professionals/${professional.user_id}`}
                >
                  {t('viewProfessional')}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>{t('additionalInformation')}</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {mission.created_at && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('createdAt')}
                </label>
                <p className='text-gray-900'>
                  {format(new Date(mission.created_at), 'dd/MM/yyyy', {
                    locale: dateLocale,
                  })}
                </p>
              </div>
            )}
            {mission.updated_at && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('updatedAt')}
                </label>
                <p className='text-gray-900'>
                  {format(new Date(mission.updated_at), 'dd/MM/yyyy', {
                    locale: dateLocale,
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
