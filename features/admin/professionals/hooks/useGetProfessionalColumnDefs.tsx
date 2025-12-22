'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { ArrowUpDown, Eye, MoreVertical } from 'lucide-react';

import type { Professional } from '@/features/professionals/professional.model';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from '@/i18n/routing';

type UseGetProfessionalColumnDefsProps = {
  locale?: string;
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
};

export default function useGetProfessionalColumnDefs({
  locale = 'en',
  translations,
}: UseGetProfessionalColumnDefsProps) {
  const dateLocale = locale === 'fr' ? fr : enUS;
  const router = useRouter();

  const onView = (professional: Professional) => {
    router.push(`/admin/professionals/${professional.user_id}`);
  };

  const columns: ColumnDef<Professional>[] = [
    {
      accessorKey: 'profile',
      cell: ({ row }) => {
        const profile = row.original.profile;
        const name = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          : 'N/A';
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
      accessorKey: 'city',
      cell: ({ row }) => {
        const city = row.getValue('city') as null | string;
        return <div>{city || 'N/A'}</div>;
      },
      header: ({ column }) => {
        return (
          <Button
            className='h-8 px-2 lg:px-3'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant='ghost'
          >
            {translations.city}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
    },
    {
      accessorKey: 'skills',
      cell: ({ row }) => {
        const skills = row.getValue('skills') as null | string[];
        if (!skills || skills.length === 0) {
          return <div className='text-muted-foreground'>-</div>;
        }
        return (
          <div className='flex flex-wrap gap-1'>
            {skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant='secondary'>
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant='secondary'>+{skills.length - 3}</Badge>
            )}
          </div>
        );
      },
      header: translations.skills,
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
        const professional = row.original;
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
                  onClick={() => onView(professional)}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  {translations.view || 'View'}
                </DropdownMenuItem>
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
