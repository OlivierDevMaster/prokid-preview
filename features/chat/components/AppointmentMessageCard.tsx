'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Check, Link2, Pencil, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

import type {
  AppointmentStatus,
  MessageWithSender,
  ViewRole,
} from '../types/chat.types';

export interface AppointmentMessageCardProps {
  message: MessageWithSender;
  onCancel?: () => void;
  onConfirm?: () => void;
  onEditLink?: () => void;
  onRefuse?: () => void;
  viewRole: ViewRole;
}

const STATUS_BADGE_CLASS: Record<AppointmentStatus, string> = {
  cancelled:
    'rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground',
  confirmed:
    'rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-green-800',
  pending:
    'rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-800',
  rejected:
    'rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-800',
};

export function AppointmentMessageCard({
  message,
  onCancel,
  onConfirm,
  onEditLink,
  onRefuse,
  viewRole,
}: AppointmentMessageCardProps) {
  const t = useTranslations('chat');
  const status = message.status ?? 'pending';
  const sentAt = format(new Date(message.created_at), 'dd/MM/yyyy', {
    locale: fr,
  });
  const sentTime = format(new Date(message.created_at), 'HH:mm');
  const isPro = viewRole === 'professional';
  const showStructureActions =
    viewRole === 'structure' && status === 'pending' && onConfirm && onRefuse;
  const showProActions =
    isPro && status === 'pending' && onEditLink && onCancel;

  const statusLabel = getStatusLabel(status, t);
  const statusBadgeClass =
    STATUS_BADGE_CLASS[status] ?? STATUS_BADGE_CLASS.pending;

  if (isPro) {
    return (
      <div className='min-w-[300px] max-w-[85%]'>
        <div className='rounded-lg border border-blue-200 bg-white p-3 shadow-sm'>
          <h3 className='flex items-center gap-2 text-sm font-semibold text-foreground'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-md bg-sky-100 text-sky-600'>
              <Calendar className='size-5' />
            </span>
            <div className='flex w-full flex-col gap-1'>
              <div className='flex w-full justify-between'>
                <span className='text-sm'>
                  {t('appointmentProposalSentTitle')}
                </span>
                <span className={statusBadgeClass}>{statusLabel}</span>
              </div>
              <div className='flex items-center gap-2 rounded-md'>
                <span className='truncate text-xs text-muted-foreground'>
                  {message.content.length > 40
                    ? `${message.content.slice(0, 40)}...`
                    : message.content}
                </span>
              </div>
            </div>
          </h3>
        </div>
        {showProActions && (
          <>
            <div className='flex justify-end gap-2 pt-2'>
              <Button onClick={onEditLink} size='sm' variant='outline'>
                <Pencil className='mr-1.5 h-4 w-4' />
                {t('appointmentEditLink')}
              </Button>
              <Button
                className='border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800'
                onClick={onCancel}
                size='sm'
                variant='outline'
              >
                <Trash2 className='mr-1.5 h-4 w-4' />
                {t('appointmentCancelProposal')}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className='max-w-[85%] rounded-lg border border-blue-200 bg-white p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded bg-sky-100 text-sky-600'>
          <Calendar className='h-5 w-5' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium text-foreground'>
            {t('appointmentProposalTitle')}
          </p>
          <p className='mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            {t('appointmentLinkLabel')}
          </p>
          <div className='mt-1 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2'>
            <Link2 className='h-4 w-4 shrink-0 text-muted-foreground' />
            <span className='truncate text-sm text-muted-foreground'>
              {message.content}
            </span>
          </div>

          {showStructureActions ? (
            <div className='mt-3 flex gap-2'>
              <Button onClick={onConfirm} size='sm'>
                <Check className='mr-1.5 h-4 w-4' />
                {t('appointmentConfirm')}
              </Button>
              <Button
                className='border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800'
                onClick={onRefuse}
                size='sm'
                variant='outline'
              >
                <X className='mr-1.5 h-4 w-4' />
                {t('appointmentRefuse')}
              </Button>
            </div>
          ) : (
            <p className='mt-2'>
              <span className={statusBadgeClass}>{statusLabel}</span>
            </p>
          )}

          <p className='mt-3 text-xs text-muted-foreground'>
            {t('sentOn', {
              date: sentAt,
              time: sentTime,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(
  status: AppointmentStatus,
  t: (key: string) => string
): string {
  switch (status) {
    case 'cancelled':
      return t('appointmentStatusCancelled');
    case 'confirmed':
      return t('appointmentStatusConfirmed');
    case 'pending':
      return t('appointmentStatusPending');
    case 'rejected':
      return t('appointmentStatusRejected');
    default:
      return t('appointmentStatusPending');
  }
}
