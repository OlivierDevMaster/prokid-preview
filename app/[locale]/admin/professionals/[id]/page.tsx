'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
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
import { EditProfessionalDialog } from '@/features/admin/professionals/components/EditProfessionalDialog';
import { useDeleteProfessional } from '@/features/professionals/hooks/useDeleteProfessional';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';

export default function AdminProfessionalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations('admin.professionals');

  const { data: professional, isLoading } = useFindProfessional(id as string);
  const deleteProfessional = useDeleteProfessional();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!professional) return;

    try {
      await deleteProfessional.mutateAsync(professional.user_id);
      router.push('/admin/professionals');
    } catch (error) {
      console.error('Error deleting professional:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {t('notFound')}
          </h1>
          <Link href='/admin/professionals'>
            <Button>{t('backToList')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const profile = professional.profile;
  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : 'N/A';

  return (
    <div className='space-y-6 bg-blue-50/30 p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/admin/professionals'>
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
              <p className='text-gray-900'>{fullName}</p>
            </div>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('email')}
              </label>
              <p className='text-gray-900'>{profile?.email || 'N/A'}</p>
            </div>
            {professional?.phone && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('phone')}
                </label>
                <p className='text-gray-900'>{professional.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        <Card>
          <CardHeader>
            <CardTitle>{t('professionalInformation')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-semibold text-gray-700'>
                {t('city')}
              </label>
              <p className='text-gray-900'>{professional.city || 'N/A'}</p>
            </div>
            {professional.postal_code && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('postalCode')}
                </label>
                <p className='text-gray-900'>{professional.postal_code}</p>
              </div>
            )}
            {professional.skills && professional.skills.length > 0 && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('skills')}
                </label>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {professional.skills.map((skill, index) => (
                    <Badge key={index} variant='secondary'>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {professional.description && (
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>{t('description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='whitespace-pre-wrap text-gray-700'>
                {professional.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Informations supplémentaires */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>{t('additionalInformation')}</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {professional.created_at && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('createdAt')}
                </label>
                <p className='text-gray-900'>
                  {new Date(professional.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
            {professional.updated_at && (
              <div>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('updatedAt')}
                </label>
                <p className='text-gray-900'>
                  {new Date(professional.updated_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditProfessionalDialog
        onOpenChange={setEditDialogOpen}
        open={editDialogOpen}
        professional={professional}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>{t('deleteProfessional')}</DialogTitle>
            <DialogDescription>
              {t('deleteProfessionalDescription', { name: fullName })}
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
              disabled={deleteProfessional.isPending}
              onClick={handleDelete}
              type='button'
              variant='destructive'
            >
              {deleteProfessional.isPending ? t('deleting') : t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
