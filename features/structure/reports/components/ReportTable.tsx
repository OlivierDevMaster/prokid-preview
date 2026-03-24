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
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  columns: ColumnDef<Report>[];
  data: Report[];
  locale?: string;
  onRowClick?: (reportId: string) => void;
  translations: {
    contents: string;
    createdAt: string;
    mission?: string;
    next: string;
    noResults?: string;
    of: string;
    page: string;
    previous: string;
    professional?: string;
    title: string;
    view?: string;
  };
}

export function ReportTable({ columns, data, onRowClick, translations }: ReportTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

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
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow className='border-slate-100 hover:bg-transparent' key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  className='bg-slate-50/80 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500'
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                className='cursor-pointer border-slate-100 transition-colors hover:bg-slate-50/50'
                data-state={row.getIsSelected() && 'selected'}
                key={row.id}
                onClick={() => onRowClick?.(row.original.id)}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell className='px-4 py-3 text-sm text-slate-700' key={cell.id}>
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
                className='h-24 text-center text-slate-500'
                colSpan={columns.length}
              >
                {translations.noResults || 'No results.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination — dashboard style */}
      <div className='flex items-center justify-between border-t border-slate-100 px-4 py-3'>
        <p className='text-sm font-medium text-slate-500'>
          {translations.page} {table.getState().pagination.pageIndex + 1}{' '}
          {translations.of} {table.getPageCount()}
        </p>
        <div className='flex items-center gap-2'>
          <Button
            className='h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40'
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            variant='outline'
          >
            <ChevronLeft className='mr-1 h-4 w-4' />
            {translations.previous}
          </Button>
          <Button
            className='h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40'
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            variant='outline'
          >
            {translations.next}
            <ChevronRight className='ml-1 h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
