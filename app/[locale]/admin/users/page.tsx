import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersTable } from '@/features/admin/users/components/UsersTable';
import { UserService } from '@/services/admin/users/user.service';

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.users' });
  const users = await UserService.getAllUsers();

  const translations = {
    createdAt: t('createdAt'),
    email: t('email'),
    emailVerified: t('emailVerified'),
    lastSignIn: t('lastSignIn'),
    name: t('name'),
    never: t('never'),
    next: t('next'),
    noName: t('noName'),
    noResults: t('noResults'),
    notVerified: t('notVerified'),
    of: t('of'),
    page: t('page'),
    previous: t('previous'),
    verified: t('verified'),
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
      </div>

      <div className='flex w-full justify-end'>
        <Button className='bg-blue-500 text-white hover:bg-blue-400'>
          <Plus className='h-4 w-4' />
          {t('addUser')}
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className='py-8 text-center text-gray-500'>{t('noUsers')}</p>
          ) : (
            <UsersTable
              data={users}
              locale={locale}
              translations={translations}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
