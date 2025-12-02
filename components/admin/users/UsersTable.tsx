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
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import type { User } from '@/services/admin/users/user.types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UsersTableProps {
  data: User[];
  locale?: string;
  translations: {
    createdAt: string;
    email: string;
    emailVerified: string;
    lastSignIn: string;
    name: string;
    never: string;
    next: string;
    noName: string;
    noResults?: string;
    notVerified: string;
    of: string;
    page: string;
    previous: string;
    verified: string;
  };
}

export function UsersTable({
  data,
  locale = 'en',
  translations,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const dateLocale = locale === 'fr' ? fr : enUS;

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      cell: ({ row }) => {
        const name = row.original.name;
        return <div className='font-medium'>{name || translations.noName}</div>;
      },
      header: ({ column }) => {
        return (
          <Button
            className='h-8 px-2 lg:px-3'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant='ghost'
          >
            {translations.name}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            className='h-8 px-2 lg:px-3'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant='ghost'
          >
            {translations.email}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'email_verified',
      cell: ({ row }) => {
        const verified = row.getValue('email_verified') as boolean;
        return (
          <Badge variant={verified ? 'default' : 'secondary'}>
            {verified ? translations.verified : translations.notVerified}
          </Badge>
        );
      },
      header: translations.emailVerified,
    },
    {
      accessorKey: 'last_sign_in_at',
      cell: ({ row }) => {
        const date = row.getValue('last_sign_in_at') as null | string;
        return (
          <div>
            {date
              ? format(new Date(date), 'PPp', { locale: dateLocale })
              : translations.never}
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
            {translations.lastSignIn}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'created_at',
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string;
        return format(new Date(date), 'PPp', { locale: dateLocale });
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
