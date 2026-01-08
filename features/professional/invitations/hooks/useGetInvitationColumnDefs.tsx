'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import Image from 'next/image';

import type { StructureInvitationWithStructure } from '@/features/structure-invitations/structureInvitation.service';

import { Badge } from '@/components/ui/badge';
import TableActions from '@/features/admin/components/TableActions';
import { TableActionType } from '@/features/admin/models/table.modele';
import { InvitationStatusLabel } from '@/features/structure-invitations/structureInvitation.model';

type UseGetInvitationColumnDefsProps = {
  locale?: string;
  onAccept?: (invitation: StructureInvitationWithStructure) => void;
  onDecline?: (invitation: StructureInvitationWithStructure) => void;
  translations: {
    accept: string;
    actions: string;
    createdAt: string;
    decline: string;
    description: string;
    name: string;
    noActions: string;
    status: string;
    title: string;
  };
};

export default function useGetInvitationColumnDefs({
  locale = 'en',
  onAccept,
  onDecline,
  translations,
}: UseGetInvitationColumnDefsProps) {
  const dateLocale = locale === 'fr' ? fr : enUS;

  const columns: ColumnDef<StructureInvitationWithStructure>[] = [
    {
      accessorKey: 'structure',
      cell: ({ row }) => {
        const invitation = row.original;
        const structure = invitation.structure;
        const profile = structure?.profile;
        const name = structure?.name || 'N/A';
        const initials =
          name
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'N/A';

        return (
          <div className='flex items-center justify-start'>
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
            <div className='ml-2 font-medium'>{name}</div>
          </div>
        );
      },
      header: () => <div className='text-left'>{translations.name}</div>,
      id: 'avatar',
    },
    {
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusLabel =
          InvitationStatusLabel[locale as 'en' | 'fr'][
            status as 'accepted' | 'declined' | 'pending'
          ] || status;

        const variant =
          status === 'accepted'
            ? 'default'
            : status === 'declined'
              ? 'destructive'
              : 'secondary';

        return (
          <div className='text-center'>
            <Badge
              className={
                status === 'accepted'
                  ? 'bg-green-500 text-white'
                  : status === 'declined'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-500 text-white'
              }
              variant={variant}
            >
              {statusLabel}
            </Badge>
          </div>
        );
      },
      header: () => <div className='text-center'>{translations.status}</div>,
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
        const invitation = row.original;
        const isPending = invitation.status === 'pending';

        const actions: TableActionType[] = [];
        if (isPending) {
          actions.push({
            icon: <CheckCircle2 className='h-4 w-4' />,
            label: translations.accept,
            onClick: () => {
              onAccept?.(invitation);
            },
          });

          actions.push({
            className: 'text-destructive focus:text-destructive',
            icon: <XCircle className='h-4 w-4' />,
            label: translations.decline,
            onClick: () => {
              onDecline?.(invitation);
            },
          });
        } else {
          actions.push({
            icon: <Info className='h-4 w-4' />,
            label: translations.noActions,
            onClick: () => {},
          });
        }

        return <TableActions actions={actions} />;
      },
      header: () => <div className='text-center'>{translations.actions}</div>,
      id: 'actions',
    },
  ];

  return columns;
}
