'use client';

import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EditStructureDialog } from '@/features/admin/structures/components/EditStructureDialog';
import { useDeleteStructure } from '@/features/structures/hooks/useDeleteStructure';
import { useFindStructure } from '@/features/structures/hooks/useFindStructure';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';

export default function AdminStructureDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations('admin.structures');
  const tCommon = useTranslations('common');

  const { data: structure, isLoading } = useFindStructure(id as string);
  const deleteStructure = useDeleteStructure();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!structure) return;

    try {
      await deleteStructure.mutateAsync(structure.user_id);
      router.push('/admin/structures');
    } catch (error) {
      console.error('Error deleting structure:', error);
    }
  };

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
    <div className='space-y-6 bg-blue-50/30 p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/admin/structures'>
            <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
          </Link>
          <h1 className='text-3xl font-bold text-gray-900'>{t('details')}</h1>
        </div>
        <div className='flex gap-3'>
          <Button
            className='border-gray-300 text-gray-700 hover:bg-gray-50'
            onClick={() => setEditDialogOpen(true)}
            variant='outline'
          >
            <Edit className='mr-2 h-4 w-4' />
            {tCommon('actions.edit')}
          </Button>
          <Button
            className='bg-red-500 text-white hover:bg-red-600'
            onClick={() => setDeleteDialogOpen(true)}
            variant='destructive'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {t('delete')}
          </Button>
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
            {structure.user_id && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('userId')}
                </label>
                <p className='font-mono text-sm text-gray-900'>
                  {structure.user_id}
                </p>
              </div>
            )}
            {structure.stripe_customer_id && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('stripeCustomerId')}
                </label>
                <p className='font-mono text-sm text-gray-900'>
                  {structure.stripe_customer_id}
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

      {/* Delete Confirmation Dialog */}
      <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>{t('deleteStructure')}</DialogTitle>
            <DialogDescription>
              {t('deleteStructureDescription', { name })}
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <p className='text-sm text-muted-foreground'>
              {t('deleteConfirmation')}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              type='button'
              variant='outline'
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={deleteStructure.isPending}
              onClick={handleDelete}
              type='button'
              variant='destructive'
            >
              {deleteStructure.isPending ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
