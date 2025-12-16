'use client';

import { Building2, Calendar, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFindStructure } from '@/features/structures/hooks/useFindStructure';
import { Link } from '@/i18n/routing';

export function StructureDetails() {
  const { id } = useParams();
  const t = useTranslations('professional.structures.details');

  const { data: structure, isLoading } = useFindStructure(id as string);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-blue-50/30'>
        <p className='text-gray-600'>{t('loading')}</p>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-blue-50/30'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {t('notFound')}
          </h1>
          <Link href='/professional/structures'>
            <Button>{t('backToList')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const profile = structure.profile;
  const name = structure.name || profile?.email || 'Unknown';

  return (
    <div className='min-h-screen bg-blue-50/30 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6'>
          <Link href='/professional/structures'>
            <Button className='mb-4' variant='ghost'>
              ← {t('backToList')}
            </Button>
          </Link>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {/* Left Column - Structure Profile */}
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
                        <Building2 className='h-12 w-12 text-gray-500' />
                      )}
                    </div>
                  </div>

                  <div className='flex-1 text-center'>
                    <h1 className='mb-2 text-2xl font-bold text-gray-800'>
                      {name}
                    </h1>
                    {profile?.email && (
                      <p className='mb-3 text-lg text-gray-700'>
                        {profile.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className='my-4 w-full border'></div>

                {/* Contact Information */}
                <div className='mb-6 space-y-3'>
                  {profile?.email && (
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Mail className='h-4 w-4 text-gray-400' />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>

                <div className='my-4 w-full border'></div>

                {/* Dates */}
                <div className='mb-6 space-y-3'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Calendar className='h-4 w-4 text-gray-400' />
                    <span>
                      {t('createdAt')}:{' '}
                      {new Date(structure.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className='my-4 w-full border'></div>

                {/* Action Buttons */}
                <div className='mb-8 flex flex-col gap-3'>
                  <Button className='flex-1 bg-blue-500 text-white hover:bg-blue-600'>
                    <Mail className='mr-2 h-4 w-4' />
                    {t('sendMessage')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Additional Information */}
          <div className='lg:col-span-2'>
            <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
              <div className='p-8'>
                <h2 className='mb-6 text-2xl font-bold text-gray-800'>
                  {t('additionalInformation')}
                </h2>

                <div className='space-y-6'>
                  {/* Structure ID */}
                  <div>
                    <h3 className='mb-2 text-sm font-semibold text-gray-700'>
                      {t('structureId')}
                    </h3>
                    <p className='text-gray-800'>{structure.user_id}</p>
                  </div>

                  {/* Created At */}
                  <div>
                    <h3 className='mb-2 text-sm font-semibold text-gray-700'>
                      {t('createdAt')}
                    </h3>
                    <p className='text-gray-800'>
                      {new Date(structure.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Updated At */}
                  <div>
                    <h3 className='mb-2 text-sm font-semibold text-gray-700'>
                      {t('updatedAt')}
                    </h3>
                    <p className='text-gray-800'>
                      {new Date(structure.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
