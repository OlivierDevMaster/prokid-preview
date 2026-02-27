'use client';

import { Funnel, MapPin, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/features/paginations/components/Pagination';
import { ProfessionalsCard } from '@/features/professionals/components/ProfessionalsCard';
import { ProfessionalConfig } from '@/features/professionals/professional.config';
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
  const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false);
  const [isAvailabilitySelectOpen, setIsAvailabilitySelectOpen] =
    useState(false);
  const isMountedRef = useRef(true);

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(ProfessionalConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(ProfessionalConfig.PAGE_SIZE_DEFAULT)
  );

  const { data } = useFindProfessionals(
    {
      availability: selectedAvailability,
      current_job: selectedRole === 'all' ? undefined : selectedRole,
      locationSearch: locationQuery,
      search: searchQuery,
    },
    { limit: pageSize, page }
  );

  const professionals: Professional[] = useMemo(() => data?.data ?? [], [data]);
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const resultsCount = totalCount;

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setSelectedRole('all');
    setSelectedAvailability('all');
  };

  const hasActiveFilters =
    searchQuery ||
    locationQuery ||
    selectedRole !== 'all' ||
    selectedAvailability !== 'all';

  // Close all Selects on unmount to prevent portal cleanup errors
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Close Selects on unmount to prevent portal cleanup errors
      // This ensures Radix portals are properly cleaned up before component unmounts
      setIsRoleSelectOpen(false);
      setIsAvailabilitySelectOpen(false);
    };
  }, []);

  return (
    <main className='min-h-screen bg-[#f5f7f5] px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 sm:mb-8'>
          <h1 className='mb-2 text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl'>
            {t('title')}
          </h1>
          <p className='text-base text-gray-600 sm:text-lg'>{t('subtitle')}</p>
        </div>

        <div
          className='mb-6 rounded-lg bg-gray-100  p-4 ring-2 sm:p-6'
          style={{
            boxShadow: 'inset 0 1px 4px 1px rgba(59, 130, 246, 0.3)',
          }}
        >
          <div className='mb-4 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4'>
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

            <Select
              onOpenChange={setIsRoleSelectOpen}
              onValueChange={setSelectedRole}
              open={isRoleSelectOpen}
              value={selectedRole}
            >
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
              onOpenChange={setIsAvailabilitySelectOpen}
              onValueChange={setSelectedAvailability}
              open={isAvailabilitySelectOpen}
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

          {hasActiveFilters && (
            <div className='flex flex-wrap items-center gap-2'>
              <div className='flex items-center gap-2 text-xs text-gray-600 sm:text-sm'>
                <Funnel className='h-3 w-3 sm:h-4 sm:w-4' />
                <span>{t('search.activeFilters')}</span>
              </div>

              {searchQuery && (
                <Badge
                  className='flex items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
                  variant='outline'
                >
                  <span className='max-w-[150px] truncate sm:max-w-none'>
                    {t('search.placeholder')}: {searchQuery}
                  </span>
                  <button
                    className='ml-1 flex-shrink-0 rounded-full hover:bg-blue-300'
                    onClick={() => setSearchQuery('')}
                    type='button'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              )}

              {locationQuery && (
                <Badge
                  className='flex items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
                  variant='outline'
                >
                  <span className='max-w-[150px] truncate sm:max-w-none'>
                    {t('search.locationPlaceholder')}: {locationQuery}
                  </span>
                  <button
                    className='ml-1 flex-shrink-0 rounded-full hover:bg-blue-300'
                    onClick={() => setLocationQuery('')}
                    type='button'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              )}

              {selectedRole !== 'all' && (
                <Badge
                  className='flex items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
                  variant='outline'
                >
                  <span className='max-w-[150px] truncate sm:max-w-none'>
                    {t('search.role')}: {t(`jobs.${selectedRole}`)}
                  </span>
                  <button
                    className='ml-1 flex-shrink-0 rounded-full hover:bg-blue-300'
                    onClick={() => setSelectedRole('all')}
                    type='button'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              )}

              {selectedAvailability !== 'all' && (
                <Badge
                  className='flex items-center gap-1 bg-blue-100 text-xs text-blue-700 hover:bg-blue-200 sm:text-sm'
                  variant='outline'
                >
                  <span className='max-w-[150px] truncate sm:max-w-none'>
                    {t('search.availability')}:{' '}
                    {t(`availability.${selectedAvailability}`)}
                  </span>
                  <button
                    className='ml-1 flex-shrink-0 rounded-full hover:bg-blue-300'
                    onClick={() => setSelectedAvailability('all')}
                    type='button'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              )}

              <Button
                className='h-7 text-xs'
                onClick={handleClearAllFilters}
                size='sm'
                variant='ghost'
              >
                {t('search.clearAll') || 'Clear all'}
              </Button>
            </div>
          )}
        </div>

        <div className='mb-4 sm:mb-6'>
          <p className='text-sm text-gray-700 sm:text-base'>
            <span className='font-semibold'>{resultsCount}</span>{' '}
            {resultsCount === 1 ? t('results.foundOne') : t('results.found')}
          </p>
        </div>

        <div className='space-y-3 sm:space-y-4'>
          {professionals.map((professional: Professional) => (
            <ProfessionalsCard
              key={professional.user_id}
              professional={professional}
            />
          ))}
        </div>

        {totalCount > 0 && (
          <div className='mt-8'>
            <Pagination
              currentPage={page}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSize={pageSize}
              totalItems={totalCount}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </main>
  );
}
