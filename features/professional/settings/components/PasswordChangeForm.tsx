'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';

export function PasswordChangeForm() {
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const [userEmail, setUserEmail] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const handleRequestPasswordReset = async () => {
    if (!userEmail) {
      setError(tAdmin('setting.passwordReset.emailNotFound'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}${
        locale === 'en' ? '' : `/${locale}`
      }/auth/update-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        userEmail,
        {
          redirectTo,
        }
      );

      if (resetError) throw resetError;

      setShowDialog(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : tAdmin('setting.passwordReset.error')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='space-y-4'>
        <h2 className='text-lg font-bold text-blue-900'>
          {tAdmin('setting.changePassword')}
        </h2>

        <div className='space-y-4'>
          {error && (
            <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
              {error}
            </div>
          )}

          <Button
            className='bg-blue-500 text-white hover:bg-blue-600'
            disabled={isLoading || !userEmail}
            onClick={handleRequestPasswordReset}
          >
            {isLoading
              ? tAdmin('setting.passwordReset.sending')
              : tAdmin('setting.passwordReset.button')}
          </Button>
        </div>
      </div>

      <Dialog
        onOpenChange={() => {
          // Prevent closing
        }}
        open={showDialog}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {tAdmin('setting.passwordReset.dialogTitle')}
            </DialogTitle>
            <DialogDescription>
              {tAdmin('setting.passwordReset.dialogMessage', {
                email: userEmail || '',
              })}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
