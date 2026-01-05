'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import { MissionConfig } from '@/features/missions/mission.config';
import {
  MissionColumn,
  MissionSortOption,
  MissionSortTitle,
  MissionStatus,
  MissionStatusLabel,
} from '@/features/missions/mission.model';
import { Order } from '@/lib/utils/enums';

import { useFindMissions } from '../hooks/useFindMissions';
import { MissionsTable } from './MissionsTable';

interface MissionsTableWrapperProps {
  locale: 'en' | 'fr';
  translations: {
    actions?: string;
    allStatuses: string;
    clearFilters: string;
    createdAt: string;
    endDate: string;
    filterByStatus: string;
    newest: string;
    next: string;
    noResults?: string;
    of: string;
    oldest: string;
    page: string;
    previous: string;
    professional: string;
    searchPlaceholder: string;
    sortBy: string;
    startDate: string;
    status: string;
    structure: string;
    titleAsc: string;
    titleColumn: string;
    titleDesc: string;
    view?: string;
  };
}

export function MissionsTableWrapper({
  locale,
  translations,
}: MissionsTableWrapperProps) {
  const t = useTranslations('admin.missions');
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(MissionConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(MissionConfig.PAGE_SIZE_DEFAULT)
  );
  const [search, setSearch] = useQueryState('search', parseAsString);
  const [status, setStatus] = useQueryState('status', parseAsString);
  const [sort, setSort] = useQueryState(
    'sort',
    parseAsString.withDefault(MissionColumn.created_at)
  );
  const [order, setOrder] = useQueryState(
    'order',
    parseAsString.withDefault(Order.desc)
  );

  const { data, isLoading } = useFindMissions(
    {
      order: (order as Order) || undefined,
      search: search || undefined,
      sort: (sort as MissionColumn | typeof MissionSortTitle) || undefined,
      status: (status as MissionStatus) || undefined,
    },
    { limit: pageSize, page }
  );

  const missions = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value || null);
    setPage(MissionConfig.PAGE_DEFAULT);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value || null);
    setPage(MissionConfig.PAGE_DEFAULT);
  };

  const handleSortChange = (value: string) => {
    // Map dropdown values to sort + order
    switch (value) {
      case MissionSortOption.newest:
        setSort(MissionColumn.created_at);
        setOrder(Order.desc);
        break;
      case MissionSortOption.oldest:
        setSort(MissionColumn.created_at);
        setOrder(Order.asc);
        break;
      case MissionSortOption.title_asc:
        setSort(MissionSortTitle);
        setOrder(Order.asc);
        break;
      case MissionSortOption.title_desc:
        setSort(MissionSortTitle);
        setOrder(Order.desc);
        break;
      default:
        setSort(MissionColumn.created_at);
        setOrder(Order.desc);
    }
    setPage(MissionConfig.PAGE_DEFAULT);
  };

  // Get current dropdown value from sort + order
  const getCurrentSortValue = (): MissionSortOption => {
    if (sort === MissionSortTitle && order === Order.asc)
      return MissionSortOption.title_asc;
    if (sort === MissionSortTitle && order === Order.desc)
      return MissionSortOption.title_desc;
    if (sort === MissionColumn.created_at && order === Order.desc)
      return MissionSortOption.newest;
    if (sort === MissionColumn.created_at && order === Order.asc)
      return MissionSortOption.oldest;
    return MissionSortOption.newest;
  };

  const hasActiveFilters = search || status;

  if (isLoading) {
    return <p className='py-8 text-center text-gray-500'>{t('loading')}</p>;
  }

  return (
    <div className='mb-36 space-y-4 md:mb-0'>
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
            <Select
              onValueChange={value =>
                handleStatusChange(value === 'all' ? '' : value)
              }
              value={status || 'all'}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={translations.filterByStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{translations.allStatuses}</SelectItem>
                <SelectItem value={MissionStatus.pending}>
                  {MissionStatusLabel[locale][MissionStatus.pending]}
                </SelectItem>
                <SelectItem value={MissionStatus.accepted}>
                  {MissionStatusLabel[locale][MissionStatus.accepted]}
                </SelectItem>
                <SelectItem value={MissionStatus.declined}>
                  {MissionStatusLabel[locale][MissionStatus.declined]}
                </SelectItem>
                <SelectItem value={MissionStatus.cancelled}>
                  {MissionStatusLabel[locale][MissionStatus.cancelled]}
                </SelectItem>
                <SelectItem value={MissionStatus.ended}>
                  {MissionStatusLabel[locale][MissionStatus.ended]}
                </SelectItem>
                <SelectItem value={MissionStatus.expired}>
                  {MissionStatusLabel[locale][MissionStatus.expired]}
                </SelectItem>
              </SelectContent>
            </Select>
            {status && (
              <Button
                className='absolute right-0 top-1/2 -translate-y-1/2'
                onClick={() => handleStatusChange('')}
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
                  handleStatusChange('');
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
              <SelectItem value={MissionSortOption.title_asc}>
                {translations.titleAsc}
              </SelectItem>
              <SelectItem value={MissionSortOption.title_desc}>
                {translations.titleDesc}
              </SelectItem>
              <SelectItem value={MissionSortOption.newest}>
                {translations.newest}
              </SelectItem>
              <SelectItem value={MissionSortOption.oldest}>
                {translations.oldest}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {missions.length === 0 ? (
        <p className='py-8 text-center text-gray-500'>
          {translations.noResults}
        </p>
      ) : (
        <MissionsTable
          currentPage={page}
          data={missions}
          locale={locale}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          translations={translations}
        />
      )}
    </div>
  );
}
