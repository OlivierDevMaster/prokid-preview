'use client';

import { MapPin, Search, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';
import { ProfessionalConfig } from '@/features/professionals/professional.config';
import {
  ProfessionalColumn,
  ProfessionalSortName,
  ProfessionalSortOption,
} from '@/features/professionals/professional.model';
import { Order } from '@/lib/utils/enums';

import { ProfessionalsTable } from './ProfessionalsTable';

interface ProfessionalsTableWrapperProps {
  locale: string;
  translations: {
    actions?: string;
    city: string;
    clearFilters: string;
    createdAt: string;
    currentJob: string;
    delete?: string;
    edit?: string;
    email: string;
    filterByCity: string;
    name: string;
    nameAsc: string;
    nameDesc: string;
    newest: string;
    next: string;
    noResults?: string;
    of: string;
    oldest: string;
    page: string;
    previous: string;
    searchPlaceholder: string;
    sortBy: string;
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
  const [sort, setSort] = useQueryState(
    'sort',
    parseAsString.withDefault(ProfessionalColumn.created_at)
  );
  const [order, setOrder] = useQueryState(
    'order',
    parseAsString.withDefault(Order.desc)
  );

  const { data, isLoading } = useFindProfessionals(
    {
      locationSearch: city || undefined,
      order: (order as Order) || undefined,
      search: search || undefined,
      sort:
        (sort as ProfessionalColumn | typeof ProfessionalSortName) || undefined,
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

  const handleSortChange = (value: string) => {
    // Map dropdown values to sort + order
    switch (value) {
      case ProfessionalSortOption.name_asc:
        setSort(ProfessionalSortName);
        setOrder(Order.asc);
        break;
      case ProfessionalSortOption.name_desc:
        setSort(ProfessionalSortName);
        setOrder(Order.desc);
        break;
      case ProfessionalSortOption.newest:
        setSort(ProfessionalColumn.created_at);
        setOrder(Order.desc);
        break;
      case ProfessionalSortOption.oldest:
        setSort(ProfessionalColumn.created_at);
        setOrder(Order.asc);
        break;
      default:
        setSort(ProfessionalColumn.created_at);
        setOrder(Order.desc);
    }
    setPage(ProfessionalConfig.PAGE_DEFAULT);
  };

  // Get current dropdown value from sort + order
  const getCurrentSortValue = (): ProfessionalSortOption => {
    if (sort === ProfessionalSortName && order === Order.asc)
      return ProfessionalSortOption.name_asc;
    if (sort === ProfessionalSortName && order === Order.desc)
      return ProfessionalSortOption.name_desc;
    if (sort === ProfessionalColumn.created_at && order === Order.desc)
      return ProfessionalSortOption.newest;
    if (sort === ProfessionalColumn.created_at && order === Order.asc)
      return ProfessionalSortOption.oldest;
    return ProfessionalSortOption.newest;
  };

  const hasActiveFilters = search || city;

  if (isLoading) {
    return <p className='py-8 text-center text-gray-500'>Loading...</p>;
  }

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input
              className='px-10'
              onChange={e => handleSearchChange(e.target.value)}
              placeholder={translations.searchPlaceholder}
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
              placeholder={translations.filterByCity}
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
                {translations.clearFilters}
              </Button>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className='flex items-center gap-2 sm:ml-auto'>
          <Select
            onValueChange={handleSortChange}
            value={getCurrentSortValue()}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder={translations.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ProfessionalSortOption.name_asc}>
                {translations.nameAsc}
              </SelectItem>
              <SelectItem value={ProfessionalSortOption.name_desc}>
                {translations.nameDesc}
              </SelectItem>
              <SelectItem value={ProfessionalSortOption.newest}>
                {translations.newest}
              </SelectItem>
              <SelectItem value={ProfessionalSortOption.oldest}>
                {translations.oldest}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
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
