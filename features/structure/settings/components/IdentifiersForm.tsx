'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { useUpdateEmail } from '@/features/professional/settings/hooks/useUpdateEmail';
import { getUser } from '@/services/auth/auth.service';

export function IdentifiersForm() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailCheckDialog, setShowEmailCheckDialog] = useState(false);
  const updateEmailMutation = useUpdateEmail();

  const { data: userProfile } = useQuery({
    enabled: !!session?.user?.id,
    queryFn: async () => {
      if (!session?.user?.id) {
        return null;
      }
      const result = await getUser(session.user.id);
      if (result.error) {
        return null;
      }
      return result.profile;
    },
    queryKey: ['user-profile', session?.user?.id],
  });

  const currentEmail = userProfile?.email || session?.user?.email || '';

  const handleUpdateClick = () => {
    setEmail(currentEmail);
    setIsEditing(true);
    updateEmailMutation.reset();
  };

  const handleCancel = () => {
    setEmail('');
    setIsEditing(false);
    updateEmailMutation.reset();
  };

  const handleSave = async () => {
    if (!email || email === currentEmail) {
      setIsEditing(false);
      return;
    }

    try {
      const emailRedirectTo = `${window.location.origin}/${locale}/structure/settings?emailUpdated=true`;

      await updateEmailMutation.mutateAsync({
        email,
        emailRedirectTo,
      });
      setIsEditing(false);
      setShowEmailCheckDialog(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('errors.updateFailed') || 'Failed to update email'
      );
    }
  };

  return (
    <>
      <div className='space-y-4'>
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

        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700' htmlFor='email'>
            {t('label.email')} *
          </Label>
          <Input
            className='w-full'
            disabled={!isEditing}
            id='email'
            onChange={e => setEmail(e.target.value)}
            placeholder='marie.joux@prokid.fr'
            readOnly={!isEditing}
            type='email'
            value={isEditing ? email : currentEmail}
          />
        </div>

        {isEditing && (
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
