'use client';

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import type { User } from '@/services/admin/users/user.types';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import useGetUserColumnDefs from '../hooks/useGetUserColumnDefs';

interface UsersTableProps {
  data: User[];
  locale?: string;
  translations: {
    actions?: string;
    createdAt: string;
    delete?: string;
    edit?: string;
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
    suspend?: string;
    verified: string;
  };
}

export function UsersTable({
  data,
  locale = 'en',
  translations,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useGetUserColumnDefs({ locale, translations });
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
