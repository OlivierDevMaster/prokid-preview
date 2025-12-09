'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type {
  Structure,
  StructureUpdate,
} from '@/features/structures/structure.model';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateStructure } from '@/features/structures/hooks/useUpdateStructure';

interface EditStructureDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  structure: null | Structure;
}

export function EditStructureDialog({
  onOpenChange,
  open,
  structure,
}: EditStructureDialogProps) {
  const t = useTranslations('admin.structures');
  const [formData, setFormData] = useState<Partial<StructureUpdate>>({});

  const updateStructure = useUpdateStructure();

  useEffect(() => {
    if (structure) {
      setFormData({
        name: structure.name || '',
      });
    }
  }, [structure]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!structure) return;

    try {
      await updateStructure.mutateAsync({
        updateData: formData as StructureUpdate,
        userId: structure.user_id,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating structure:', error);
    }
  };

  if (!structure) return null;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('editStructure')}</DialogTitle>
          <DialogDescription>{t('editStructureDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>{t('name')}</Label>
              <Input
                id='name'
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                value={formData.name || ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type='button'
              variant='outline'
            >
              {t('cancel')}
            </Button>
            <Button disabled={updateStructure.isPending} type='submit'>
              {updateStructure.isPending ? t('updating') : t('update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
