'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { ArrowUpDown, Eye, MoreVertical } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MissionStatus,
  MissionStatusLabel,
} from '@/features/missions/mission.model';
import { useRouter } from '@/i18n/routing';

import type { AdminMission } from '../services/mission.service';

type UseGetMissionColumnDefsProps = {
  locale?: string;
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
};

export default function useGetMissionColumnDefs({
  locale = 'en',
  translations,
}: UseGetMissionColumnDefsProps) {
  const dateLocale = locale === 'fr' ? fr : enUS;
  const router = useRouter();

  const onView = (mission: AdminMission) => {
    router.push(`/admin/missions/${mission.id}`);
  };

  const columns: ColumnDef<AdminMission>[] = [
    {
      accessorKey: 'title',
      cell: ({ row }) => {
        const title = row.getValue('title') as string;
        return <div className='font-medium'>{title || 'N/A'}</div>;
      },
      header: ({ column }) => {
        return (
          <Button
            className='h-8 px-2 lg:px-3'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant='ghost'
          >
            {translations.titleColumn}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusLabel =
          MissionStatusLabel[locale as 'en' | 'fr']?.[
            status as keyof typeof MissionStatusLabel.en
          ] || status;
        return (
          <div>
            <Badge
              className={getStatusBadgeClassName(status)}
              variant='default'
            >
              {statusLabel}
            </Badge>
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
            {translations.status}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'structure',
      cell: ({ row }) => {
        const structure = row.original.structure;
        const name = structure?.name || 'N/A';
        return <div>{name}</div>;
      },
      header: ({ column }) => {
        return (
          <Button
            className='h-8 px-2 lg:px-3'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant='ghost'
          >
            {translations.structure}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'professional',
      cell: ({ row }) => {
        const professional = row.original.professional;
        const profile = professional?.profile;
        const name = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          : 'N/A';
        return <div>{name || 'N/A'}</div>;
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
    },
    {
      accessorKey: 'mission_dtstart',
      cell: ({ row }) => {
        const date = row.getValue('mission_dtstart') as string;
        return (
          <div className='text-center'>
            {format(new Date(date), 'dd/MM/yyyy', { locale: dateLocale })}
          </div>
        );
      },
      header: ({ column }) => {
        return (
          <div className='flex justify-center'>
            <Button
              className='h-8 px-2 lg:px-3'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              variant='ghost'
            >
              {translations.startDate}
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'mission_until',
      cell: ({ row }) => {
        const date = row.getValue('mission_until') as string;
        return (
          <div className='text-center'>
            {format(new Date(date), 'dd/MM/yyyy', { locale: dateLocale })}
          </div>
        );
      },
      header: ({ column }) => {
        return (
          <div className='flex justify-center'>
            <Button
              className='h-8 px-2 lg:px-3'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              variant='ghost'
            >
              {translations.endDate}
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string;
        return (
          <div className='text-center'>
            {format(new Date(date), 'dd/MM/yyyy', { locale: dateLocale })}
          </div>
        );
      },
      header: ({ column }) => {
        return (
          <div className='flex justify-center'>
            <Button
              className='h-8 px-2 lg:px-3'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              variant='ghost'
            >
              {translations.createdAt}
              <ArrowUpDown className='ml-2 h-4 w-4' />
            </Button>
          </div>
        );
      },
    },
    {
      cell: ({ row }) => {
        const mission = row.original;
        return (
          <div className='flex justify-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='h-8 w-8' size='icon' variant='ghost'>
                  <MoreVertical className='h-4 w-4' />
                  <span className='sr-only'>
                    {translations.actions || 'Actions'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  className='cursor-pointer'
                  onClick={() => onView(mission)}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  {translations.view || 'View'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      header: () => (
        <div className='text-center'>{translations.actions || 'Actions'}</div>
      ),
      id: 'actions',
    },
  ];

  return columns;
}

function getStatusBadgeClassName(status: string): string {
  const statusMap: Record<string, string> = {
    [MissionStatus.accepted]: 'bg-green-500 text-white',
    [MissionStatus.cancelled]: 'bg-gray-500 text-white',
    [MissionStatus.declined]: 'bg-red-500 text-white',
    [MissionStatus.ended]: 'bg-blue-500 text-white',
    [MissionStatus.expired]: 'bg-orange-500 text-white',
    [MissionStatus.pending]: 'bg-yellow-500 text-white',
  };

  return statusMap[status] || 'bg-gray-500 text-white';
}
