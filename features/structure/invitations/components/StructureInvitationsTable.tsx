'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type { StructureInvitationWithProfessional } from '@/features/structure-invitations/structureInvitation.service';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/features/paginations/components/Pagination';

import useGetStructureInvitationColumnDefs from '../hooks/useGetStructureInvitationColumnDefs';

interface StructureInvitationsTableProps {
  currentPage: number;
  data: StructureInvitationWithProfessional[];
  locale?: string;
  onCancel?: (invitation: StructureInvitationWithProfessional) => void;
  onDelete?: (invitation: StructureInvitationWithProfessional) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  translations: {
    actions: string;
    cancel: string;
    createdAt: string;
    delete: string;
    name: string;
    noActions: string;
    noResults: string;
    status: string;
  };
}

export function StructureInvitationsTable({
  currentPage,
  data,
  locale = 'en',
  onCancel,
  onDelete,
  onPageChange,
  onPageSizeChange,
  pageSize,
  totalCount,
  totalPages,
  translations,
}: StructureInvitationsTableProps) {
  const columns = useGetStructureInvitationColumnDefs({
    locale,
    onCancel,
    onDelete,
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
                  {translations.noResults}
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
