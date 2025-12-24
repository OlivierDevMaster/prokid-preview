import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { ArrowUpDown, Eye } from 'lucide-react';

import type { Report as ReportWithRelations } from '@/features/reports/report.model';
import type { Report } from '@/services/admin/reports/report.types';

import { Button } from '@/components/ui/button';
import TableActions from '@/features/admin/components/TableActions';
import { TableActionType } from '@/features/admin/models/table.modele';

type UseReportColumnDefsProps = {
  locale?: string;
  onViewReport: (reportId: string) => void;
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
};

export default function useReportColumnDefs({
  locale = 'en',
  onViewReport,
  translations,
}: UseReportColumnDefsProps) {
  const dateLocale = locale === 'fr' ? fr : enUS;

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
      id: 'report-title',
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
      id: 'mission-title',
    },
    {
      accessorKey: 'title',
      cell: ({ row }) => {
        const reportWithProfessional = row.original as ReportWithRelations;
        const professionalName = reportWithProfessional.author?.profile
          ? `${reportWithProfessional.author.profile.first_name || ''} ${reportWithProfessional.author.profile.last_name || ''}`.trim() ||
            reportWithProfessional.author.profile.email ||
            'Unknown'
          : 'Unknown';
        return (
          <div className='max-w-md'>
            <div title={professionalName}>{professionalName}</div>
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
            {translations.professional}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      id: 'professional-name',
    },
    {
      accessorKey: 'contents',
      cell: ({ row }) => {
        const contents = row.original.content;
        return (
          <div
            className='line-clamp-2 max-w-md text-sm text-gray-600'
            title={contents}
          >
            {contents}
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
        const actions: TableActionType[] = [
          {
            icon: <Eye className='h-4 w-4' />,
            label: translations.view || 'View',
            onClick: () => {
              onViewReport(row.original.id);
            },
          },
        ];

        return <TableActions actions={actions} />;
      },
      header: '',
      id: 'actions',
    },
  ];

  return {
    columns,
  };
}
