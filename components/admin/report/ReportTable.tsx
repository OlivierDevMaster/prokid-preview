'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { ArrowUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useState } from 'react';

import type { Report } from '@/services/admin/reports/report.types';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReportTableProps {
  data: Report[];
  locale?: string;
  translations: {
    contents: string;
    createdAt: string;
    next: string;
    noResults?: string;
    of: string;
    page: string;
    previous: string;
    title: string;
    view?: string;
  };
}

export function ReportTable({
  data,
  locale = 'en',
  translations,
}: ReportTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const dateLocale = locale === 'fr' ? fr : enUS;

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: 'title',
      cell: ({ row }) => {
        const title = row.original.title;
        return (
          <div className='max-w-md truncate font-medium' title={title}>
            {title}
          </div>
        );
      },
      header: ({ column }) => {
        return (
          <Button
            className='h-8 px-2 lg:px-3'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant='ghost'
          >
            {translations.title}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'contents',
      cell: ({ row }) => {
        const contents = row.original.contents;
        // Limiter l'affichage à 100 caractères
        const truncated =
          contents.length > 100 ? contents.substring(0, 100) + '...' : contents;
        return (
          <div className='max-w-md text-sm text-gray-600' title={contents}>
            {truncated}
          </div>
        );
      },
      header: translations.contents,
    },
    {
      accessorKey: 'created_at',
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string;
        return (
          <div className='text-sm'>
            {format(new Date(date), 'PPp', { locale: dateLocale })}
          </div>
        );
      },
      header: ({ column }) => {
        return (
          <Button
            className='h-8 px-2 lg:px-3'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant='ghost'
          >
            {translations.createdAt}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      cell: ({ row }) => {
        return (
          <div className='flex justify-end'>
            <Button
              onClick={() => {
                // TODO: Implémenter l'action de visualisation
                console.log('View report:', row.original.id);
              }}
              size='sm'
              variant='ghost'
            >
              <Eye className='mr-2 h-4 w-4' />
              {translations.view || 'View'}
            </Button>
          </div>
        );
      },
      header: '',
      id: 'actions',
    },
  ];

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  key={row.id}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className='h-24 text-center'
                  colSpan={columns.length}
                >
                  {translations.noResults || 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          {translations.page} {table.getState().pagination.pageIndex + 1}{' '}
          {translations.of} {table.getPageCount()}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size='sm'
            variant='outline'
          >
            <ChevronLeft className='h-4 w-4' />
            {translations.previous}
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size='sm'
            variant='outline'
          >
            {translations.next}
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
