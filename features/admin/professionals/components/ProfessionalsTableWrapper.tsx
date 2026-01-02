'use client';

import { MapPin, Search, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';
import { ProfessionalConfig } from '@/features/professionals/professional.config';

import { ProfessionalsTable } from './ProfessionalsTable';

interface ProfessionalsTableWrapperProps {
  locale: string;
  translations: {
    actions?: string;
    city: string;
    createdAt: string;
    currentJob: string;
    delete?: string;
    edit?: string;
    email: string;
    name: string;
    next: string;
    noResults?: string;
    of: string;
    page: string;
    previous: string;
    view?: string;
  };
}

export function ProfessionalsTableWrapper({
  locale,
  translations,
}: ProfessionalsTableWrapperProps) {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(ProfessionalConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(ProfessionalConfig.PAGE_SIZE_DEFAULT)
  );
  const [search, setSearch] = useQueryState('search', parseAsString);
  const [city, setCity] = useQueryState('city', parseAsString);

  const { data, isLoading } = useFindProfessionals(
    {
      locationSearch: city || undefined,
      search: search || undefined,
    },
    { limit: pageSize, page }
  );

  const professionals = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value || null);
    setPage(ProfessionalConfig.PAGE_DEFAULT);
  };

  const handleCityChange = (value: string) => {
    setCity(value || null);
    setPage(ProfessionalConfig.PAGE_DEFAULT);
  };

  const hasActiveFilters = search || city;

  if (isLoading) {
    return <p className='py-8 text-center text-gray-500'>Loading...</p>;
  }

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
          <Input
            className='px-10'
            onChange={e => handleSearchChange(e.target.value)}
            placeholder='Search by name or email...'
            value={search || ''}
          />
          {search && (
            <Button
              className='absolute right-0 top-1/2 -translate-y-1/2'
              onClick={() => handleSearchChange('')}
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
            onChange={e => handleCityChange(e.target.value)}
            placeholder='Filter by city...'
            value={city || ''}
          />
          {city && (
            <Button
              className='absolute right-0 top-1/2 -translate-y-1/2'
              onClick={() => handleCityChange('')}
              variant='ghost'
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className='flex items-center'>
            <Button
              onClick={() => {
                handleSearchChange('');
                handleCityChange('');
              }}
              variant='outline'
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      {professionals.length === 0 ? (
        <p className='py-8 text-center text-gray-500'>
          {translations.noResults}
        </p>
      ) : (
        <ProfessionalsTable
          currentPage={page}
          data={professionals}
          locale={locale}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          translations={{
            ...translations,
          }}
        />
      )}
    </div>
  );
}
