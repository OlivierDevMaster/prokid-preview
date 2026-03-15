'use client';

import { Pencil, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { useUpdateProfessional } from '@/features/professionals/hooks/useUpdateProfessional';
import { useUpdateProfile } from '@/features/profiles/hooks';

export function PersonalContactSection() {
  const t = useTranslations('admin.setting');
  const tCommon = useTranslations('common');
  const tOnboarding = useTranslations('professional.onboarding');
  const { data: session } = useSession();
  const userId = session?.user?.id ?? '';
  const { data: professional } = useFindProfessional(userId);
  const updateProfile = useUpdateProfile();
  const updateProfessional = useUpdateProfessional();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const startEdit = () => {
    if (!professional) {
      return;
    }
    setFirstName(professional.profile.first_name ?? '');
    setLastName(professional.profile.last_name ?? '');
    setPhone(professional.phone ?? '');
    setCity(professional.city ?? '');
    setPostalCode(professional.postal_code ?? '');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const save = async () => {
    if (!userId || !professional) {
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(tCommon('messages.errorSaving'));
      return;
    }
    const cityTrimmed = city.trim();
    if (!cityTrimmed) {
      toast.error(tOnboarding('validation.cityRequired'));
      return;
    }
    try {
      const tasks: Promise<unknown>[] = [];
      if (
        firstName.trim() !== (professional.profile.first_name ?? '') ||
        lastName.trim() !== (professional.profile.last_name ?? '')
      ) {
        tasks.push(
          updateProfile.mutateAsync({
            updateData: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            },
            userId,
          })
        );
      }
      const proUpdate: {
        city?: string;
        phone?: null | string;
        postal_code?: null | string;
      } = {};
      if ((phone.trim() || null) !== (professional.phone ?? null)) {
        proUpdate.phone = phone.trim() || null;
      }
      if (cityTrimmed !== professional.city) {
        proUpdate.city = cityTrimmed;
      }
      const postal = postalCode.trim() || null;
      if (postal !== (professional.postal_code ?? null)) {
        proUpdate.postal_code = postal;
      }
      if (Object.keys(proUpdate).length > 0) {
        tasks.push(
          updateProfessional.mutateAsync({
            professionalId: userId,
            updateData: proUpdate,
          })
        );
      }
      await Promise.all(tasks);
      setIsEditing(false);
      toast.success(t('saveChanges'));
    } catch {
      toast.error(tCommon('messages.errorSaving'));
    }
  };

  if (!professional) {
    return null;
  }

  const addressLine =
    professional.city && professional.postal_code
      ? `${professional.city}, ${professional.postal_code}`
      : professional.city || professional.postal_code || '—';

  return (
    <section className='rounded-xl bg-white p-6 shadow-sm'>
      <h2 className='mb-4 flex w-full flex-wrap items-center gap-2 text-xl font-bold'>
        <User className='size-6 text-[#4A90E2]' />
        {t('psPersonalInfo')}
        {!isEditing && (
          <Button
            className='ml-auto text-slate-400 hover:bg-slate-100 hover:text-[#4A90E2]'
            onClick={startEdit}
            size='icon'
            variant='ghost'
          >
            <Pencil className='size-5' />
          </Button>
        )}
      </h2>
      {isEditing ? (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='rounded-lg bg-[#f6f6f8] p-4'>
              <Label
                className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'
                htmlFor='pc-first'
              >
                {tCommon('label.firstName')}
              </Label>
              <Input
                className='mt-1 border-slate-200 bg-white'
                id='pc-first'
                onChange={e => setFirstName(e.target.value)}
                value={firstName}
              />
            </div>
            <div className='rounded-lg bg-[#f6f6f8] p-4'>
              <Label
                className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'
                htmlFor='pc-last'
              >
                {tCommon('label.lastName')}
              </Label>
              <Input
                className='mt-1 border-slate-200 bg-white'
                id='pc-last'
                onChange={e => setLastName(e.target.value)}
                value={lastName}
              />
            </div>
          </div>
          <div className='rounded-lg bg-[#f6f6f8] p-4'>
            <Label
              className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'
              htmlFor='pc-address-city'
            >
              {t('psAddress')}
            </Label>
            <div className='mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <Input
                className='border-slate-200 bg-white'
                id='pc-address-city'
                onChange={e => setCity(e.target.value)}
                placeholder={tCommon('label.city')}
                value={city}
              />
              <Input
                className='border-slate-200 bg-white'
                id='pc-address-postal'
                onChange={e => setPostalCode(e.target.value)}
                placeholder={tCommon('label.postalCode')}
                value={postalCode}
              />
            </div>
          </div>
          <div className='rounded-lg bg-[#f6f6f8] p-4'>
            <Label
              className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'
              htmlFor='pc-phone'
            >
              {tCommon('label.phone')}
            </Label>
            <Input
              className='mt-1 border-slate-200 bg-white'
              id='pc-phone'
              onChange={e => setPhone(e.target.value)}
              type='tel'
              value={phone}
            />
          </div>
          <div className='ml-auto flex flex-wrap justify-end gap-2'>
            <Button onClick={cancelEdit} type='button' variant='outline'>
              {t('psCancel')}
            </Button>
            <Button
              className='bg-[#4A90E2] hover:opacity-90'
              disabled={updateProfile.isPending || updateProfessional.isPending}
              onClick={save}
              type='button'
            >
              {t('psSave')}
            </Button>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='rounded-lg bg-[#f6f6f8] p-4'>
            <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'>
              {tCommon('label.firstName')}
            </span>
            <p className='font-medium'>
              {professional.profile.first_name ?? '—'}
            </p>
          </div>
          <div className='rounded-lg bg-[#f6f6f8] p-4'>
            <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'>
              {tCommon('label.lastName')}
            </span>
            <p className='font-medium'>
              {professional.profile.last_name ?? '—'}
            </p>
          </div>
          <div className='rounded-lg bg-[#f6f6f8] p-4 sm:col-span-2'>
            <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'>
              {t('psAddress')}
            </span>
            <p className='font-medium'>{addressLine}</p>
          </div>
          <div className='rounded-lg bg-[#f6f6f8] p-4 sm:col-span-2'>
            <span className='mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400'>
              {tCommon('label.phone')}
            </span>
            <p className='font-medium'>{professional.phone ?? '—'}</p>
          </div>
        </div>
      )}
    </section>
  );
}
