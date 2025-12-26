'use client';

import { Funnel, MapPin, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfessionalsCard } from '@/features/professionals/components/ProfessionalsCard';
import { ProfessionalSkills } from '@/features/professionals/professional.config';
import { Professional } from '@/features/professionals/professional.model';

import { useFindProfessionals } from '../hooks/useFindProfessionals';

export default function ProfessionalsPage() {
  const t = useTranslations('professional');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] =
    useState<string>('all');
  const { data } = useFindProfessionals(
    {
      availability: selectedAvailability,
      current_job: selectedRole === 'all' ? undefined : selectedRole,
      locationSearch: locationQuery,
      search: searchQuery,
    },
    { limit: 100 }
  );

  const professionals: Professional[] = useMemo(() => data?.data ?? [], [data]);

  const resultsCount = professionals.length;

  return (
    <main className='min-h-screen bg-[#f5f7f5] px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-8'>
          <h1 className='mb-2 text-4xl font-bold text-gray-800'>
            {t('title')}
          </h1>
          <p className='text-lg text-gray-600'>{t('subtitle')}</p>
        </div>

        <div
          className='mb-6 rounded-lg bg-gray-100 bg-white p-6 ring-2'
          style={{
            boxShadow: 'inset 0 1px 4px 1px rgba(59, 130, 246, 0.3)',
          }}
        >
          <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <Input
                className='px-10'
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                value={searchQuery}
              />
              {searchQuery && (
                <Button
                  className='absolute right-0 top-1/2 -translate-y-1/2'
                  onClick={() => setSearchQuery('')}
                  variant='ghost'
                >
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>

            <div className='relative'>
              <MapPin className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <Input
                className='px-10'
                onChange={e => setLocationQuery(e.target.value)}
                placeholder={t('search.locationPlaceholder')}
                value={locationQuery}
              />
              {locationQuery && (
                <Button
                  className='absolute right-0 top-1/2 -translate-y-1/2'
                  onClick={() => setLocationQuery('')}
                  variant='ghost'
                >
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>

            <Select onValueChange={setSelectedRole} value={selectedRole}>
              <SelectTrigger>
                <SelectValue placeholder={t('search.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('roles.all')}</SelectItem>
                {ProfessionalSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {t(`jobs.${skill}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={setSelectedAvailability}
              value={selectedAvailability}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('search.availability')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('availability.all')}</SelectItem>
                <SelectItem value='morning'>
                  {t('availability.morning')}
                </SelectItem>
                <SelectItem value='afternoon'>
                  {t('availability.afternoon')}
                </SelectItem>
                <SelectItem value='fullDay'>
                  {t('availability.fullDay')}
                </SelectItem>
                <SelectItem value='weekend'>
                  {t('availability.weekend')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery ||
            locationQuery ||
            selectedRole !== 'all' ||
            selectedAvailability !== 'all') && (
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Funnel className='h-4 w-4' />
              {t('search.activeFilters')}
            </div>
          )}
        </div>

        <div className='mb-6'>
          <p className='text-gray-700'>
            <span className='font-semibold'>{resultsCount}</span>{' '}
            {resultsCount === 1 ? t('results.foundOne') : t('results.found')}
          </p>
        </div>

        <div className='space-y-4'>
          {professionals.map((professional: Professional) => (
            <ProfessionalsCard
              key={professional.user_id}
              professional={professional}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
