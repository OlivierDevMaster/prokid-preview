import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddUserButton } from '@/features/admin/users/components/AddUserButton';
import { UsersTable } from '@/features/admin/users/components/UsersTable';
import { User } from '@/features/admin/users/modeles/user.modele';

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.users' });
  const users: User[] = [];

  const translations = {
    actions: t('actions'),
    createdAt: t('createdAt'),
    delete: t('delete'),
    edit: t('edit'),
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
    suspend: t('suspend'),
    verified: t('verified'),
    view: t('view'),
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>{t('title')}</h1>
        <p className='mt-2 text-gray-600'>{t('subtitle')}</p>
      </div>

      <div className='flex w-full justify-end'>
        <AddUserButton />
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
