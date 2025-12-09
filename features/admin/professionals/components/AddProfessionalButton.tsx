'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { ProfessionalInsert } from '@/features/professionals/professional.model';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProfessional } from '@/features/professionals/hooks/useCreateProfessional';

export function AddProfessionalButton() {
  const t = useTranslations('admin.professionals');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfessionalInsert>>({
    city: '',
    description: '',
    postal_code: '',
    skills: [],
  });

  const createProfessional = useCreateProfessional();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form validation and user_id selection
    // For now, this is a placeholder
    if (!formData.user_id) {
      alert('User ID is required');
      return;
    }

    try {
      await createProfessional.mutateAsync(formData as ProfessionalInsert);
      setOpen(false);
      setFormData({
        city: '',
        description: '',
        postal_code: '',
        skills: [],
      });
    } catch (error) {
      console.error('Error creating professional:', error);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className='bg-blue-500 text-white hover:bg-blue-400'>
          <Plus className='h-4 w-4' />
          {t('addProfessional')}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('addProfessional')}</DialogTitle>
          <DialogDescription>
            {t('addProfessionalDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='user_id'>{t('userId')}</Label>
              <Input
                id='user_id'
                onChange={e =>
                  setFormData({ ...formData, user_id: e.target.value })
                }
                placeholder={t('userIdPlaceholder')}
                required
                type='text'
                value={formData.user_id || ''}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description'>{t('description')}</Label>
              <Textarea
                id='description'
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t('descriptionPlaceholder')}
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
                placeholder={t('cityPlaceholder')}
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
                placeholder={t('postalCodePlaceholder')}
                value={formData.postal_code || ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type='button'
              variant='outline'
            >
              {t('cancel')}
            </Button>
            <Button disabled={createProfessional.isPending} type='submit'>
              {createProfessional.isPending ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
