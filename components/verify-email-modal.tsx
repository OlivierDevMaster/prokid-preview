'use client';

import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type VerifyEmailModalProps = {
  email: string;
  onClose?: () => void;
  open: boolean;
};

export function VerifyEmailModal({ email, onClose, open }: VerifyEmailModalProps) {
  const t = useTranslations('auth.signUp.verifyEmail');

  return (
    <Dialog onOpenChange={isOpen => { if (!isOpen && onClose) onClose(); }} open={open}>
      <DialogContent
        className='sm:max-w-md'
      >
        <DialogHeader>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
            <Mail className='h-8 w-8 text-blue-600' />
          </div>
          <DialogTitle className='text-center'>{t('title')}</DialogTitle>
          <DialogDescription className='text-center'>
            {t('description', { email })}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <p className='text-center text-sm text-gray-600'>
            {t('instructions')}
          </p>
          <div className='rounded-md bg-blue-50 p-4'>
            <p className='text-sm text-blue-800'>{t('checkSpam')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
