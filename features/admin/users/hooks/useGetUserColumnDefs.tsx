'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import {
  ArrowUpDown,
  Edit,
  Eye,
  MoreVertical,
  Trash2,
  UserX,
} from 'lucide-react';
import { useRouter } from '@/i18n/routing';

import type { User } from '@/services/admin/users/user.types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UseGetUserColumnDefsProps = {
  locale?: string;
  translations: {
    actions?: string;
    createdAt: string;
    delete?: string;
    edit?: string;
    email: string;
    emailVerified: string;
    lastSignIn: string;
    name: string;
    never: string;
    next: string;
    noName: string;
    noResults?: string;
    notVerified: string;
    of: string;
    page: string;
    previous: string;
    suspend?: string;
    verified: string;
    view?: string;
  };
};

export default function useGetUserColumnDefs({
  locale = 'en',
  translations,
}: UseGetUserColumnDefsProps) {
  const dateLocale = locale === 'fr' ? fr : enUS;
  const router = useRouter();
  const onDelete = (user: User) => {
    console.info('Delete user:', user);
  };
  const onEdit = (user: User) => {
    console.info('Edit user:', user);
  };
  const onSuspend = (user: User) => {
    console.info('Suspend user:', user);
  };

  const onView = (user: User) => {
    router.push(`/admin/users/${user.id}`);
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      cell: ({ row }) => {
        const name = row.original.name;
        return <div className='font-medium'>{name || translations.noName}</div>;
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
      accessorKey: 'email',
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
      accessorKey: 'email_verified',
      cell: ({ row }) => {
        const verified = row.getValue('email_verified') as boolean;
        return (
          <Badge variant={verified ? 'default' : 'secondary'}>
            {verified ? translations.verified : translations.notVerified}
          </Badge>
        );
      },
      header: translations.emailVerified,
    },
    {
      accessorKey: 'last_sign_in_at',
      cell: ({ row }) => {
        const date = row.getValue('last_sign_in_at') as null | string;
        return (
          <div>
            {date
              ? format(new Date(date), 'PPp', { locale: dateLocale })
              : translations.never}
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
            {translations.lastSignIn}
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
        const user = row.original;
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
                  onClick={() => onView(user)}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  {translations.view || 'View'}
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem
                    className='cursor-pointer'
                    onClick={() => onEdit(user)}
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    {translations.edit || 'Edit'}
                  </DropdownMenuItem>
                )}
                {onSuspend && (
                  <DropdownMenuItem
                    className='cursor-pointer'
                    onClick={() => onSuspend(user)}
                  >
                    <UserX className='mr-2 h-4 w-4' />
                    {translations.suspend || 'Suspend'}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='cursor-pointer text-destructive focus:text-destructive'
                      onClick={() => onDelete(user)}
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
