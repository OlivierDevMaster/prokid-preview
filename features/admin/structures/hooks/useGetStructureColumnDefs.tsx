'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { ArrowUpDown, Edit, Eye, MoreVertical, Trash2 } from 'lucide-react';

import type { Structure } from '@/features/structures/structure.model';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from '@/i18n/routing';

type UseGetStructureColumnDefsProps = {
  locale?: string;
  translations: {
    actions?: string;
    createdAt: string;
    delete?: string;
    edit?: string;
    email: string;
    name: string;
    next: string;
    noResults?: string;
    of: string;
    onDelete?: (structure: Structure) => void;
    onEdit?: (structure: Structure) => void;
    page: string;
    previous: string;
    view?: string;
  };
};

export default function useGetStructureColumnDefs({
  locale = 'en',
  translations,
}: UseGetStructureColumnDefsProps) {
  const dateLocale = locale === 'fr' ? fr : enUS;
  const router = useRouter();

  const onView = (structure: Structure) => {
    router.push(`/admin/structures/${structure.user_id}`);
  };

  const onEdit = (structure: Structure) => {
    if (translations.onEdit) {
      translations.onEdit(structure);
    }
  };

  const onDelete = (structure: Structure) => {
    if (translations.onDelete) {
      translations.onDelete(structure);
    }
  };

  const columns: ColumnDef<Structure>[] = [
    {
      accessorKey: 'name',
      cell: ({ row }) => {
        const name = row.getValue('name') as string;
        return <div className='font-medium'>{name || 'N/A'}</div>;
      },
      header: ({ column }) => {
        return (
          <Button
            className='h-8 px-2 lg:px-3'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant='ghost'
          >
            {translations.name}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'profile.email',
      cell: ({ row }) => {
        const email = row.original.profile?.email || 'N/A';
        return <div>{email}</div>;
      },
      header: ({ column }) => {
        return (
          <Button
            className='h-8 px-2 lg:px-3'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant='ghost'
          >
            {translations.email}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'created_at',
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string;
        return format(new Date(date), 'PPp', { locale: dateLocale });
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
        const structure = row.original;
        return (
          <div className='flex justify-end'>
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
                  onClick={() => onView(structure)}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  {translations.view || 'View'}
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem
                    className='cursor-pointer'
                    onClick={() => onEdit(structure)}
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    {translations.edit || 'Edit'}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='cursor-pointer text-destructive focus:text-destructive'
                      onClick={() => onDelete(structure)}
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      {translations.delete || 'Delete'}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      header: '',
      id: 'actions',
    },
  ];

  return columns;
}
