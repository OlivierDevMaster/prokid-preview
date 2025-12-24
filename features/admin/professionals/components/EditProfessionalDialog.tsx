'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type {
  Professional,
  ProfessionalUpdate,
} from '@/features/professionals/professional.model';

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
import { Textarea } from '@/components/ui/textarea';
import { useUpdateProfessional } from '@/features/professionals/hooks/useUpdateProfessional';

interface EditProfessionalDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  professional: null | Professional;
}

export function EditProfessionalDialog({
  onOpenChange,
  open,
  professional,
}: EditProfessionalDialogProps) {
  const t = useTranslations('admin.professionals');
  const [formData, setFormData] = useState<Partial<ProfessionalUpdate>>({});

  const updateProfessional = useUpdateProfessional();

  useEffect(() => {
    if (professional) {
      setFormData({
        city: professional.city || '',
        description: professional.description || '',
        postal_code: professional.postal_code || '',
        skills: professional.skills || [],
      });
    }
  }, [professional]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professional) return;

    try {
      await updateProfessional.mutateAsync({
        professionalId: professional.user_id,
        updateData: formData as ProfessionalUpdate,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating professional:', error);
    }
  };

  if (!professional) return null;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('editProfessional')}</DialogTitle>
          <DialogDescription>
            {t('editProfessionalDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='description'>{t('description')}</Label>
              <Textarea
                id='description'
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                value={formData.description || ''}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='city'>{t('city')}</Label>
              <Input
                id='city'
                onChange={e =>
                  setFormData({ ...formData, city: e.target.value })
                }
                value={formData.city || ''}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='postal_code'>{t('postalCode')}</Label>
              <Input
                id='postal_code'
                onChange={e =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                value={formData.postal_code || ''}
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
            <Button
              className='bg-blue-500 text-white hover:bg-blue-600'
              disabled={updateProfessional.isPending}
              type='submit'
            >
              {updateProfessional.isPending ? t('updating') : t('update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
