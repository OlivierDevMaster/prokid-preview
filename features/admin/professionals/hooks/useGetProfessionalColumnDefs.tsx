'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { Eye, MoreVertical } from 'lucide-react';

import type { Professional } from '@/features/professionals/professional.model';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
      accessorKey: 'skills',
      cell: ({ row }) => {
        const skills = row.getValue('skills') as null | string[];
        if (!skills || skills.length === 0) {
          return <div className='text-muted-foreground'>-</div>;
        }

        // Mobile: Show only first skill, rest in popover
        // Desktop: Show first 3 skills, rest in popover
        const firstSkill = skills[0];
        const remainingSkillsMobile = skills.slice(1);
        const desktopSkills = skills.slice(0, 3);
        const remainingSkillsDesktop = skills.slice(3);

        return (
          <div className='flex flex-wrap items-center gap-1'>
            {/* Mobile: First skill only */}
            <div className='flex items-center gap-1 sm:hidden'>
              <Badge variant='secondary'>{firstSkill}</Badge>
              {remainingSkillsMobile.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className='h-5 px-2 text-xs'
                      size='sm'
                      variant='outline'
                    >
                      +{remainingSkillsMobile.length}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align='start' className='w-56'>
                    <div className='space-y-2'>
                      <h4 className='text-sm font-semibold'>All Skills</h4>
                      <div className='flex flex-wrap gap-1'>
                        {skills.map((skill, index) => (
                          <Badge key={index} variant='secondary'>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Desktop: First 3 skills, rest in popover */}
            <div className='hidden items-center gap-1 sm:flex'>
              {desktopSkills.map((skill, index) => (
                <Badge key={index} variant='secondary'>
                  {skill}
                </Badge>
              ))}
              {remainingSkillsDesktop.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className='h-5 px-2 text-xs'
                      size='sm'
                      variant='outline'
                    >
                      +{remainingSkillsDesktop.length}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align='start' className='w-56'>
                    <div className='space-y-2'>
                      <h4 className='text-sm font-semibold'>All Skills</h4>
                      <div className='flex flex-wrap gap-1'>
                        {skills.map((skill, index) => (
                          <Badge key={index} variant='secondary'>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        );
      },
      header: translations.skills,
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
