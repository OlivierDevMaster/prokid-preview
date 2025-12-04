'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';

export function AddUserButton() {
  const t = useTranslations('admin.users');
  const onClick = () => {
    redirect('/admin/users/new');
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
