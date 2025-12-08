'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { StructureInsert } from '@/features/structures/structure.model';

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
import { useCreateStructure } from '@/features/structures/hooks/useCreateStructure';

export function AddStructureButton() {
  const t = useTranslations('admin.structures');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<StructureInsert>>({
    name: '',
  });

  const createStructure = useCreateStructure();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      return;
    }

    try {
      await createStructure.mutateAsync(formData as StructureInsert);
      setOpen(false);
      setFormData({
        name: '',
      });
    } catch (error) {
      console.error('Error creating structure:', error);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className='bg-blue-500 text-white hover:bg-blue-400'>
          <Plus className='h-4 w-4' />
          {t('addStructure')}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{t('addStructure')}</DialogTitle>
          <DialogDescription>{t('addStructureDescription')}</DialogDescription>
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
                placeholder={t('namePlaceholder')}
                required
                type='text'
                value={formData.name || ''}
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
            <Button disabled={createStructure.isPending} type='submit'>
              {createStructure.isPending ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
