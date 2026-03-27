'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { Eye, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import type { Professional } from '@/features/professionals/professional.model';

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
    currentJob: string;
    delete?: string;
    edit?: string;
    email: string;
    name: string;
    next: string;
    noResults?: string;
    of: string;
    page: string;
    previous: string;
    view?: string;
  };
};

export default function useGetProfessionalColumnDefs({
  locale = 'en',
  translations,
}: UseGetProfessionalColumnDefsProps) {
  const dateLocale = locale === 'fr' ? fr : enUS;
  const router = useRouter();
  const tProfessional = useTranslations('professional');

  const onView = (professional: Professional) => {
    router.push(`/admin/professionals/${professional.user_id}`);
  };

  const getJobTranslation = (job: null | string | undefined): string => {
    if (!job) {
      return 'N/A';
    }
    try {
      const translationKey = `jobs.${job}`;
      const translated = tProfessional(translationKey);
      // If translation doesn't exist, next-intl returns the full key path
      // Check if it's the same as what we'd expect for a missing key
      if (
        translated === translationKey ||
        translated === `professional.${translationKey}`
      ) {
        return job;
      }
      return translated;
    } catch {
      return job;
    }
  };

  const columns: ColumnDef<Professional>[] = [
    {
      accessorKey: 'profile',
      cell: ({ row }) => {
        const profile = row.original.profile;
        const name = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          : 'N/A';
        const initials = profile
          ? `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || ''}`
              .trim()
              .toUpperCase() || 'N/A'
          : 'N/A';

        return (
          <div className='flex items-center gap-3'>
            <div className='relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
              {profile?.avatar_url ? (
                <Image
                  alt={name || 'Professional profile photo'}
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
            <div className='font-medium'>{name || 'N/A'}</div>
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
      accessorKey: 'city',
      cell: ({ row }) => {
        const city = row.getValue('city') as null | string;
        return <div>{city || 'N/A'}</div>;
      },
      header: translations.city,
    },
    {
      accessorKey: 'current_job',
      cell: ({ row }) => {
        const currentJob = row.getValue('current_job') as null | string;
        return <div>{currentJob ? getJobTranslation(currentJob) : 'N/A'}</div>;
      },
      header: translations.currentJob,
    },
    {
      accessorKey: 'reviews_count',
      cell: ({ row }) => {
        const count = row.original.reviews_count ?? 0;
        const rating = row.original.rating ? Number(row.original.rating).toFixed(1) : null;
        return (
          <div className='text-center text-sm'>
            {rating ? (
              <span className='font-medium text-amber-600'>{rating}★ ({count})</span>
            ) : (
              <span className='text-slate-400'>—</span>
            )}
          </div>
        );
      },
      header: () => <div className='text-center'>Avis</div>,
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
        const professional = row.original;
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
      header: () => (
        <div className='text-center'>{translations.actions || 'Actions'}</div>
      ),
      id: 'actions',
    },
  ];

  return columns;
}
