'use client';

import { Link2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ProposeAppointmentModalProps {
  /** When set, modal is in edit mode (pre-filled link, title for editing). */
  initialLink?: null | string;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (link: string) => void;
  open: boolean;
}

export function ProposeAppointmentModal({
  initialLink = null,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
  open,
}: ProposeAppointmentModalProps) {
  const t = useTranslations('chat');
  const [link, setLink] = useState(initialLink ?? '');
  const isEditMode = initialLink != null && initialLink !== '';

  useEffect(() => {
    if (!open) {
      setLink('');
    } else if (initialLink != null) {
      setLink(initialLink);
    }
  }, [open, initialLink]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isSubmitting) {
      setLink('');
      onOpenChange(false);
    }
  };

  const handleSubmit = () => {
    const trimmed = link.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    if (!isEditMode) {
      setLink('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t('proposeAppointmentEditTitle')
              : t('proposeAppointmentTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('proposeAppointmentLinkDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className='py-2'>
          <Label
            className='mb-2 block text-sm font-medium'
            htmlFor='propose-appointment-link'
          >
            {t('proposeAppointmentLinkLabel')}
          </Label>
          <div className='relative'>
            <Link2 className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              className='pl-9'
              id='propose-appointment-link'
              onChange={e => setLink(e.target.value)}
              placeholder='https://meet.google.com/xxx-xxx-xxx'
              type='url'
              value={link}
            />
          </div>
        </div>

        <DialogFooter className='flex-row justify-end gap-2 sm:justify-end'>
          <Button
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
            variant='outline'
          >
            {t('proposeAppointmentCancel')}
          </Button>
          <Button
            disabled={isSubmitting || !link.trim()}
            onClick={handleSubmit}
          >
            {isEditMode
              ? t('proposeAppointmentSave')
              : t('proposeAppointmentConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
