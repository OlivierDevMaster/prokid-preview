'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/features/paginations/components/Pagination';

import type { AdminMission } from '../services/mission.service';

import useGetMissionColumnDefs from '../hooks/useGetMissionColumnDefs';

interface MissionsTableProps {
  currentPage: number;
  data: AdminMission[];
  locale?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  translations: {
    actions?: string;
    createdAt: string;
    endDate: string;
    next: string;
    noResults?: string;
    of: string;
    page: string;
    previous: string;
    professional: string;
    startDate: string;
    status: string;
    structure: string;
    titleColumn: string;
    view?: string;
  };
}

export function MissionsTable({
  currentPage,
  data,
  locale = 'en',
  onPageChange,
  onPageSizeChange,
  pageSize,
  totalCount,
  totalPages,
  translations,
}: MissionsTableProps) {
  const columns = useGetMissionColumnDefs({
    locale,
    translations,
  });
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='space-y-4'>
      <div className='rounded-md border bg-white'>
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
      <Pagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSize={pageSize}
        totalItems={totalCount}
        totalPages={totalPages}
      />
    </div>
  );
}
