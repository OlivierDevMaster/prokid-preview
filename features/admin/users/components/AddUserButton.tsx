'use client';

import { Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { redirect } from '@/i18n/routing';

export function AddUserButton() {
  const t = useTranslations('admin.users');
  const locale = useLocale();
  const onClick = () => {
    redirect({ href: '/admin/users/new', locale });
  };

  return (
    <Button
      className='bg-blue-500 text-white hover:bg-blue-400'
      onClick={onClick}
    >
      <Plus className='h-4 w-4' />
      {t('addUser')}
    </Button>
  );
}
