'use client';

import { useTranslations } from 'next-intl';

import type { Professional } from '@/features/professionals/professional.model';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteProfessional } from '@/features/professionals/hooks/useDeleteProfessional';

interface DeleteProfessionalDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  professional: null | Professional;
}

export function DeleteProfessionalDialog({
  onOpenChange,
  open,
  professional,
}: DeleteProfessionalDialogProps) {
  const t = useTranslations('admin.professionals');

  const deleteProfessional = useDeleteProfessional();

  const handleDelete = async () => {
    if (!professional) return;

    try {
      await deleteProfessional.mutateAsync(professional.user_id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting professional:', error);
    }
  };

  if (!professional) return null;

  const profile = professional.profile;
  const name = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : 'N/A';

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('deleteProfessional')}</DialogTitle>
          <DialogDescription>
            {t('deleteProfessionalDescription', { name })}
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm text-muted-foreground'>
            {t('deleteConfirmation')}
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
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
  );
}
