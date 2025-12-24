'use client';

import { useTranslations } from 'next-intl';

import type { Structure } from '@/features/structures/structure.model';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteStructure } from '@/features/structures/hooks/useDeleteStructure';

interface DeleteStructureDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  structure: null | Structure;
}

export function DeleteStructureDialog({
  onOpenChange,
  open,
  structure,
}: DeleteStructureDialogProps) {
  const t = useTranslations('admin.structures');

  const deleteStructure = useDeleteStructure();

  const handleDelete = async () => {
    if (!structure) return;

    try {
      await deleteStructure.mutateAsync(structure.user_id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting structure:', error);
    }
  };

  if (!structure) return null;

  const name = structure.name || 'N/A';

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
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
            onClick={() => onOpenChange(false)}
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
  );
}
