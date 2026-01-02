'use client';

import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Euro,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AvailabilityCalendar } from '@/features/professional/components/AvailabilityCalendar';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { Link } from '@/i18n/routing';

import { useHasActiveMission } from '../hooks/useHasActiveMission';

export function ProfessionalDetails() {
  const { id } = useParams();
  const t = useTranslations('structure.professionals.details');
  const tCommon = useTranslations('common');
  const tProfessional = useTranslations('professional');

  const { data: professional, isLoading } = useFindProfessional(id as string);
  const { data: hasActiveMission } = useHasActiveMission(id as string);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-blue-50/30'>
        <p className='text-gray-600'>{t('loading')}</p>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-blue-50/30'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {t('notFound')}
          </h1>
          <Link href='/structure/professionals'>
            <Button>{t('backToList')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const profile = professional.profile;
  const name = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
      profile.email ||
      tCommon('messages.unknown')
    : tCommon('messages.unknown');

  const initials = name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className='min-h-screen bg-blue-50/30 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6'>
          <Link href='/structure/professionals'>
            <Button className='mb-4' variant='ghost'>
              ← {t('backToList')}
            </Button>
          </Link>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {/* Left Column - Professional Profile */}
          <div className='lg:col-span-1'>
            <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
              <div className='p-8'>
                {/* Profile Header */}
                <div className='mb-8 flex flex-col items-center gap-6'>
                  <div className='flex-shrink-0'>
                    <div className='flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-300 bg-gray-200'>
                      {profile?.avatar_url ? (
                        <Image
                          alt={name}
                          className='h-full w-full object-cover'
                          height={96}
                          src={profile.avatar_url}
                          unoptimized
                          width={96}
                        />
                      ) : (
                        <span className='text-4xl font-semibold text-gray-500'>
                          {initials}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex-1 text-center'>
                    <h1 className='mb-2 text-2xl font-bold text-gray-800'>
                      {name}
                    </h1>
                    {professional.current_job && (
                      <p className='mb-3 text-lg text-gray-700'>
                        {tProfessional(`jobs.${professional.current_job}`)}
                      </p>
                    )}

                    {/* Badges */}
                    <div className='mb-4 flex flex-wrap justify-center gap-2'>
                      {professional.is_certified && (
                        <Badge className='bg-green-200 text-green-800 hover:bg-green-300'>
                          <CheckCircle2 className='mr-1 h-3 w-3' />
                          {t('certified')}
                        </Badge>
                      )}
                      {!hasActiveMission && (
                        <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-200'>
                          {t('available')}
                        </Badge>
                      )}
                      {hasActiveMission && (
                        <Badge className='bg-red-100 text-red-700 hover:bg-red-200'>
                          {t('unavailable')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className='my-4 w-full border'></div>

                {/* Skills */}
                {professional.skills && professional.skills.length > 0 && (
                  <>
                    <div className='mb-6'>
                      <h2 className='mb-3 text-sm font-semibold text-gray-700'>
                        {t('skills')}
                      </h2>
                      <div className='flex flex-wrap gap-2'>
                        {professional.skills.map((skill, index) => (
                          <Badge
                            className='border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                            key={index}
                            variant='outline'
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className='my-4 w-full border'></div>
                  </>
                )}

                {/* Location and Experience */}
                <div className='mb-6 space-y-3'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <MapPin className='h-4 w-4 text-gray-400' />
                    <span>
                      {professional.city}
                      {professional.postal_code &&
                        `, ${professional.postal_code}`}
                      {professional.intervention_radius_km > 0 && (
                        <>
                          {' • '}
                          {tCommon('label.km')}{' '}
                          {professional.intervention_radius_km}
                        </>
                      )}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <CalendarIcon className='h-4 w-4 text-gray-400' />
                    <span>
                      {professional.experience_years} {t('yearsExperience')}
                    </span>
                  </div>
                </div>

                {/* Rates */}
                <div className='mb-6 flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <Euro className='h-5 w-5 text-gray-600' />
                    <span className='text-lg font-semibold text-gray-800'>
                      {professional.hourly_rate}€/{t('hour')}
                    </span>
                  </div>
                </div>

                <div className='my-4 w-full border'></div>

                {/* Contact Information */}
                {(profile?.email || professional.phone) && (
                  <div className='mb-6 space-y-3'>
                    <h2 className='text-sm font-semibold text-gray-700'>
                      {t('contact')}
                    </h2>
                    {profile?.email && (
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Mail className='h-4 w-4 text-gray-400' />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {professional.phone && (
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Phone className='h-4 w-4 text-gray-400' />
                        <span>{professional.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* About Section */}
                {professional.description && (
                  <div className='border-t pt-6'>
                    <h2 className='mb-3 text-lg font-bold text-gray-800'>
                      {t('about')}
                    </h2>
                    <p className='leading-relaxed text-gray-600'>
                      {professional.description}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Availability Calendar */}
          <div className='lg:col-span-2'>
            <AvailabilityCalendar professionalId={id as string} />
          </div>
        </div>
      </div>
    </div>
  );
}
