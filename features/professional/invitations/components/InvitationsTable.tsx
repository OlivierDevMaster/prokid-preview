'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type { StructureInvitationWithStructure } from '@/features/structure-invitations/structureInvitation.service';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/features/paginations/components/Pagination';

import useGetInvitationColumnDefs from '../hooks/useGetInvitationColumnDefs';

interface InvitationsTableProps {
  currentPage: number;
  data: StructureInvitationWithStructure[];
  locale?: string;
  onAccept?: (invitation: StructureInvitationWithStructure) => void;
  onDecline?: (invitation: StructureInvitationWithStructure) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  translations: {
    accept: string;
    actions: string;
    createdAt: string;
    decline: string;
    description: string;
    name: string;
    noActions: string;
    noResults: string;
    status: string;
    title: string;
  };
}

export function InvitationsTable({
  currentPage,
  data,
  locale = 'en',
  onAccept,
  onDecline,
  onPageChange,
  onPageSizeChange,
  pageSize,
  totalCount,
  totalPages,
  translations,
}: InvitationsTableProps) {
  const columns = useGetInvitationColumnDefs({
    locale,
    onAccept,
    onDecline,
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
