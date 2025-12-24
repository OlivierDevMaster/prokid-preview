'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditStructureDialog } from '@/features/admin/structures/components/EditStructureDialog';
import { useFindStructure } from '@/features/structures/hooks/useFindStructure';

export default function AdminStructureDetailsPage() {
  const { id } = useParams();
  const t = useTranslations('admin.structures');

  const { data: structure, isLoading } = useFindStructure(id as string);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    );
  }

  if (!structure) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {t('notFound')}
          </h1>
          <Link href='/admin/structures'>
            <Button>{t('backToList')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const profile = structure.profile;
  const name = structure.name || 'N/A';

  return (
    <div className='min-h-screen space-y-6 overflow-hidden bg-blue-50/30 p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/admin/structures'>
            <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
          </Link>
          <h1 className='text-3xl font-bold text-gray-900'>{t('details')}</h1>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>{t('personalInformation')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('name')}
              </label>
              <p className='text-gray-900'>{name}</p>
            </div>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('email')}
              </label>
              <p className='text-gray-900'>{profile?.email || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informations supplémentaires */}
        <Card>
          <CardHeader>
            <CardTitle>{t('additionalInformation')}</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-4'>
            {structure.created_at && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('createdAt')}
                </label>
                <p className='text-gray-900'>
                  {new Date(structure.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
            {structure.updated_at && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('updatedAt')}
                </label>
                <p className='text-gray-900'>
                  {new Date(structure.updated_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditStructureDialog
        onOpenChange={setEditDialogOpen}
        open={editDialogOpen}
        structure={structure}
      />
    </div>
  );
}
