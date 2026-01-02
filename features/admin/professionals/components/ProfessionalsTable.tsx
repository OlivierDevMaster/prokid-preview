'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type { Professional } from '@/features/professionals/professional.model';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/features/paginations/components/Pagination';

import useGetProfessionalColumnDefs from '../hooks/useGetProfessionalColumnDefs';

interface ProfessionalsTableProps {
  currentPage: number;
  data: Professional[];
  locale?: string;
  onDelete?: (professional: Professional) => void;
  onEdit?: (professional: Professional) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  translations: {
    actions?: string;
    city: string;
    createdAt: string;
    delete?: string;
    edit?: string;
    email: string;
    name: string;
    next: string;
    noResults?: string;
    of: string;
    page: string;
    previous: string;
    skills: string;
    view?: string;
  };
}

export function ProfessionalsTable({
  currentPage,
  data,
  locale = 'en',
  onPageChange,
  onPageSizeChange,
  pageSize,
  totalCount,
  totalPages,
  translations,
}: ProfessionalsTableProps) {
  const columns = useGetProfessionalColumnDefs({
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
