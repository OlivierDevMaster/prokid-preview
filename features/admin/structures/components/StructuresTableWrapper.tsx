'use client';

import { Search, X } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useState } from 'react';

import type { Structure } from '@/features/structures/structure.model';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFindStructures } from '@/features/structures/hooks/useFindStructures';
import { StructureConfig } from '@/features/structures/structure.config';
import {
  StructureColumn,
  StructureSortName,
  StructureSortOption,
} from '@/features/structures/structure.model';
import { Order } from '@/lib/utils/enums';

import { DeleteStructureDialog } from './DeleteStructureDialog';
import { EditStructureDialog } from './EditStructureDialog';
import { StructuresTable } from './StructuresTable';

interface StructuresTableWrapperProps {
  locale: string;
  translations: {
    actions?: string;
    createdAt: string;
    delete?: string;
    edit?: string;
    email: string;
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
    view?: string;
  };
}

export function StructuresTableWrapper({
  locale,
  translations,
}: StructuresTableWrapperProps) {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(StructureConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(StructureConfig.PAGE_SIZE_DEFAULT)
  );
  const [search, setSearch] = useQueryState('search', parseAsString);
  const [sort, setSort] = useQueryState(
    'sort',
    parseAsString.withDefault(StructureColumn.created_at)
  );
  const [order, setOrder] = useQueryState(
    'order',
    parseAsString.withDefault(Order.desc)
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<null | Structure>(
    null
  );

  const { data, isLoading } = useFindStructures(
    {
      order: (order as Order) || undefined,
      search: search || undefined,
      sort: (sort as StructureColumn | typeof StructureSortName) || undefined,
    },
    { limit: pageSize, page }
  );

  const structures = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleEdit = (structure: Structure) => {
    setSelectedStructure(structure);
    setEditDialogOpen(true);
  };

  const handleDelete = (structure: Structure) => {
    setSelectedStructure(structure);
    setDeleteDialogOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value || null);
    setPage(StructureConfig.PAGE_DEFAULT);
  };

  const handleSortChange = (value: string) => {
    // Map dropdown values to sort + order
    switch (value) {
      case StructureSortOption.name_asc:
        setSort(StructureSortName);
        setOrder(Order.asc);
        break;
      case StructureSortOption.name_desc:
        setSort(StructureSortName);
        setOrder(Order.desc);
        break;
      case StructureSortOption.newest:
        setSort(StructureColumn.created_at);
        setOrder(Order.desc);
        break;
      case StructureSortOption.oldest:
        setSort(StructureColumn.created_at);
        setOrder(Order.asc);
        break;
      default:
        setSort(StructureColumn.created_at);
        setOrder(Order.desc);
    }
    setPage(StructureConfig.PAGE_DEFAULT);
  };

  // Get current dropdown value from sort + order
  const getCurrentSortValue = (): StructureSortOption => {
    if (sort === StructureSortName && order === Order.asc)
      return StructureSortOption.name_asc;
    if (sort === StructureSortName && order === Order.desc)
      return StructureSortOption.name_desc;
    if (sort === StructureColumn.created_at && order === Order.desc)
      return StructureSortOption.newest;
    if (sort === StructureColumn.created_at && order === Order.asc)
      return StructureSortOption.oldest;
    return StructureSortOption.newest;
  };

  const hasActiveFilters = search;

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

          {hasActiveFilters && (
            <div className='flex items-center'>
              <Button
                onClick={() => {
                  handleSearchChange('');
                }}
                variant='outline'
              >
                Clear filters
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
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={StructureSortOption.name_asc}>
                {translations.nameAsc}
              </SelectItem>
              <SelectItem value={StructureSortOption.name_desc}>
                {translations.nameDesc}
              </SelectItem>
              <SelectItem value={StructureSortOption.newest}>
                {translations.newest}
              </SelectItem>
              <SelectItem value={StructureSortOption.oldest}>
                {translations.oldest}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {structures.length === 0 ? (
        <p className='py-8 text-center text-gray-500'>
          {translations.noResults}
        </p>
      ) : (
        <>
          <StructuresTable
            currentPage={page}
            data={structures}
            locale={locale}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            translations={{
              ...translations,
              onDelete: handleDelete,
              onEdit: handleEdit,
            }}
          />
          <EditStructureDialog
            onOpenChange={setEditDialogOpen}
            open={editDialogOpen}
            structure={selectedStructure}
          />
          <DeleteStructureDialog
            onOpenChange={setDeleteDialogOpen}
            open={deleteDialogOpen}
            structure={selectedStructure}
          />
        </>
      )}
    </div>
  );
}
