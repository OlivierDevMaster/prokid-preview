'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowUpRight, Calendar, Check, Pencil, Trash2, X } from 'lucide-react';
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
        <div className='rounded-2xl border border-blue-200 bg-white p-3 shadow-sm'>
          <h3 className='flex items-center gap-2 text-sm font-semibold text-foreground'>
            <span className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600'>
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
    <div className='min-w-[300px] max-w-[85%]'>
      <div className='rounded-2xl border border-blue-200 bg-white p-3 shadow-sm'>
        <div className='flex items-start gap-3'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600'>
            <Calendar className='size-5' />
          </div>
          <div className='flex w-full flex-col gap-1'>
            <span className='text-sm font-semibold text-foreground'>
              {t('appointmentProposalTitle')}
            </span>
            <span className={`mt-1 inline-flex w-fit ${statusBadgeClass}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      {status === 'confirmed' && (
        <div className='flex justify-end gap-2 pt-2'>
          <Button asChild className='h-8 px-3 text-xs' size='sm'>
            <a href={message.content} rel='noreferrer' target='_blank'>
              {t('appointmentOpenLink')}

              <ArrowUpRight className='size-10!' />
            </a>
          </Button>
        </div>
      )}
      {showStructureActions && status === 'pending' && (
        <div className='flex justify-start gap-2 pt-2'>
          <Button
            className='border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800'
            onClick={onRefuse}
            size='sm'
            variant='outline'
          >
            <X className='mr-1.5 h-4 w-4' />
            {t('appointmentRefuse')}
          </Button>
          <Button onClick={onConfirm} size='sm'>
            <Check className='mr-1.5 h-4 w-4' />
            {t('appointmentConfirm')}
          </Button>
        </div>
      )}
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
