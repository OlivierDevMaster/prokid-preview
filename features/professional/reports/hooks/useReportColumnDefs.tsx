import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { ArrowUpDown, Edit, Eye, Send, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { Report } from '@/services/admin/reports/report.types';

import { Button } from '@/components/ui/button';
import TableActions from '@/features/admin/components/TableActions';
import { TableActionType } from '@/features/professional/tables/TableActionType';

type UseReportColumnDefsProps = {
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
};

export default function useReportColumnDefs({
  locale = 'en',
  translations,
}: UseReportColumnDefsProps) {
  const dateLocale = locale === 'fr' ? fr : enUS;
  const router = useRouter();

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
        const contents = row.original.content;
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
        const actions: TableActionType[] = [];

        actions.push({
          icon: <Eye className='h-4 w-4' />,
          label: translations.view || 'View',
          onClick: () => {
            router.push(`/admin/report/${row.original.id}`);
          },
        });

        actions.push({
          icon: <Edit className='h-4 w-4' />,
          label: 'Edit',
          onClick: () => {
            router.push(`/admin/report/${row.original.id}/edit`);
          },
        });

        actions.push({
          icon: <Send className='h-4 w-4' />,
          label: 'Send',
          onClick: () => {
            router.push(`/admin/report/${row.original.id}/edit`);
          },
        });

        actions.push({
          icon: <Trash className='h-4 w-4' />,
          label: 'Delete',
          onClick: () => {
            router.push(`/admin/report/${row.original.id}/delete`);
          },
        });

        return <TableActions actions={actions} />;
      },
      header: '',
      id: 'actions',
    },
  ];

  return columns;
}
