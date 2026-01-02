'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { Eye, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import type { Structure } from '@/features/structures/structure.model';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const columns: ColumnDef<Structure>[] = [
    {
      accessorKey: 'name',
      cell: ({ row }) => {
        const structure = row.original;
        const name = structure.name || 'N/A';
        const profile = structure.profile;
        const initials =
          name
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'N/A';

        return (
          <div className='flex items-center gap-3'>
            <div className='relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
              {profile?.avatar_url ? (
                <Image
                  alt={name || 'Structure profile photo'}
                  className='h-full w-full object-cover'
                  height={40}
                  src={profile.avatar_url}
                  unoptimized
                  width={40}
                />
              ) : (
                <span className='text-sm font-semibold text-gray-600'>
                  {initials}
                </span>
              )}
            </div>
            <div className='font-medium'>{name}</div>
          </div>
        );
      },
      header: translations.name,
    },
    {
      accessorKey: 'profile.email',
      cell: ({ row }) => {
        const email = row.original.profile?.email || 'N/A';
        return <div>{email}</div>;
      },
      header: translations.email,
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
      header: () => <div className='text-center'>{translations.createdAt}</div>,
    },
    {
      cell: ({ row }) => {
        const structure = row.original;
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
                  onClick={() => onView(structure)}
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
