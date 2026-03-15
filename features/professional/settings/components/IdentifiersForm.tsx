'use client';

import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFindProfile } from '@/features/profiles/hooks';

import { useUpdateEmail } from '../hooks/useUpdateEmail';

type IdentifiersFormProps = {
  minimalDialog?: boolean;
};

export function IdentifiersForm({
  minimalDialog = false,
}: IdentifiersFormProps) {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(minimalDialog);
  const [email, setEmail] = useState('');
  const [showEmailCheckDialog, setShowEmailCheckDialog] = useState(false);
  const updateEmailMutation = useUpdateEmail();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useFindProfile(session?.user?.id);

  const currentEmail = profile?.email || session?.user?.email || '';

  useLayoutEffect(() => {
    if (minimalDialog && currentEmail) {
      setEmail(currentEmail);
      setIsEditing(true);
    }
  }, [minimalDialog, currentEmail]);

  useEffect(() => {
    if (!minimalDialog) {
      return;
    }
    const id = requestAnimationFrame(() => {
      emailInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [minimalDialog]);

  const handleUpdateClick = () => {
    setEmail(currentEmail);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (minimalDialog) {
      setEmail(currentEmail);
      return;
    }
    setEmail('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!email || email === currentEmail) {
      if (!minimalDialog) {
        setIsEditing(false);
      }
      return;
    }

    try {
      const userRole = profile?.role;
      let emailRedirectTo: string | undefined;

      if (userRole === 'professional') {
        emailRedirectTo = `${window.location.origin}/${locale}/professional/settings?tab=profile&emailUpdated=true`;
      } else if (userRole === 'structure') {
        emailRedirectTo = `${window.location.origin}/${locale}/structure/settings?tab=profile&emailUpdated=true`;
      } else if (userRole === 'admin') {
        emailRedirectTo = `${window.location.origin}/${locale}/admin/settings?tab=profile&emailUpdated=true`;
      }

      await updateEmailMutation.mutateAsync({
        email,
        emailRedirectTo,
      });
      if (!minimalDialog) {
        setIsEditing(false);
      }
      setShowEmailCheckDialog(true);
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const editing = minimalDialog || isEditing;
  const displayValue = editing ? email : currentEmail;

  return (
    <>
      <div className='space-y-4'>
        {!minimalDialog && (
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-bold text-blue-900'>
              {tAdmin('setting.identifiers')}
            </h2>
            {!isEditing && (
              <Button onClick={handleUpdateClick} size='sm' variant='outline'>
                {t('actions.edit')}
              </Button>
            )}
          </div>
        )}

        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700' htmlFor='email'>
            {t('label.email')} *
          </Label>
          <Input
            autoFocus={minimalDialog}
            className='w-full'
            disabled={!editing}
            id='email'
            onChange={e => setEmail(e.target.value)}
            placeholder='marie.joux@prokid.fr'
            readOnly={!editing}
            ref={emailInputRef}
            type='email'
            value={displayValue}
          />
        </div>

        {editing && (
          <div className='flex justify-end gap-2'>
            <Button onClick={handleCancel} size='sm' variant='outline'>
              {t('actions.cancel')}
            </Button>
            <Button
              className='bg-blue-500 text-white hover:bg-blue-600'
              disabled={updateEmailMutation.isPending}
              onClick={handleSave}
              size='sm'
            >
              {updateEmailMutation.isPending
                ? t('messages.saving')
                : t('actions.save')}
            </Button>
          </div>
        )}
      </div>

      <Dialog
        onOpenChange={open => {
          if (!open) {
            return;
          }
        }}
        open={showEmailCheckDialog}
      >
        <DialogContent
          onEscapeKeyDown={e => e.preventDefault()}
          onInteractOutside={e => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>{tAdmin('setting.emailUpdateTitle')}</DialogTitle>
            <DialogDescription>
              {tAdmin('setting.emailUpdateMessage')}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
