import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { ArrowUpDown, Edit, Eye, Send, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { Report as ReportWithRelations } from '@/features/reports/report.model';
import type { Report } from '@/services/admin/reports/report.types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TableActions from '@/features/admin/components/TableActions';
import { TableActionType } from '@/features/admin/models/table.modele';
import { useDeleteReport } from '@/features/reports/hooks/useDeleteReport';
import { useRouter } from '@/i18n/routing';

type UseReportColumnDefsProps = {
  locale?: string;
  translations: {
    contents: string;
    createdAt: string;
    mission?: string;
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
  const t = useTranslations('admin.report');
  const { isPending: isDeleting, mutate: deleteReport } = useDeleteReport();
  const [reportToDelete, setReportToDelete] = useState<null | string>(null);

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: 'title',
      cell: ({ row }) => {
        const title = row.original.title;
        return (
          <div className='max-w-md'>
            <div className='truncate font-medium' title={title}>
              {title}
            </div>
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
      accessorKey: 'title',
      cell: ({ row }) => {
        const reportWithMission = row.original as ReportWithRelations;
        const missionTitle = reportWithMission.mission?.title || null;
        return (
          <div className='max-w-md'>
            {missionTitle && <div title={missionTitle}>{missionTitle}</div>}
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
            {translations.mission}
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
            {format(new Date(date), 'dd/MM/yyyy', { locale: dateLocale })}
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
            router.push(`/professional/reports/${row.original.id}`);
          },
        });

        const status = row.original.status;

        // Only allow edit/delete if status is draft
        if (status === 'draft') {
          actions.push({
            icon: <Send className='h-4 w-4' />,
            label: 'Send',
            onClick: () => {
              router.push(`/professional/reports/${row.original.id}`);
            },
          });

          actions.push({
            icon: <Edit className='h-4 w-4' />,
            label: 'Edit',
            onClick: () => {
              router.push(`/professional/reports/${row.original.id}/edit`);
            },
          });

          actions.push({
            icon: <Trash className='h-4 w-4' />,
            label: 'Delete',
            onClick: () => {
              setReportToDelete(row.original.id);
            },
          });
        }

        return <TableActions actions={actions} />;
      },
      header: '',
      id: 'actions',
    },
  ];

  const handleDeleteConfirm = () => {
    if (reportToDelete) {
      deleteReport(reportToDelete);
      setReportToDelete(null);
    }
  };

  const DeleteDialog = (
    <Dialog
      onOpenChange={open => {
        if (!open) {
          setReportToDelete(null);
        }
      }}
      open={!!reportToDelete}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('deleteReport') || 'Delete Report'}</DialogTitle>
          <DialogDescription>
            {t('deleteReportDescription') ||
              'Are you sure you want to delete this report? This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={isDeleting}
            onClick={() => setReportToDelete(null)}
            type='button'
            variant='outline'
          >
            {t('cancel') || 'Cancel'}
          </Button>
          <Button
            className='bg-red-600 text-white hover:bg-red-700'
            disabled={isDeleting}
            onClick={handleDeleteConfirm}
            type='button'
          >
            {isDeleting
              ? t('deleting') || 'Deleting...'
              : t('delete') || 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return {
    columns,
    deleteDialog: DeleteDialog,
  };
}
