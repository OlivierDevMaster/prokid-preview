'use client';

import { Briefcase, Camera, Info, MapPin, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { useUpdateProfile } from '@/features/profiles/hooks';
import {
  deleteProfilePhoto,
  uploadProfilePhoto,
} from '@/features/profiles/profile.service';

export function ProfileSummaryHeader() {
  const t = useTranslations('admin.setting');
  const tCommon = useTranslations('common');
  const tProfessional = useTranslations('professional');
  const { data: session } = useSession();
  const userId = session?.user?.id ?? '';
  const { data: professional } = useFindProfessional(userId);
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<null | string>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const jobLabel = useMemo(() => {
    if (!professional?.current_job) {
      return 'Psychomotricienne';
    }
    const key = `jobs.${professional.current_job}`;
    const label = tProfessional(key);
    if (label === key || label === `professional.${key}`) {
      return professional.current_job;
    }
    return label;
  }, [professional?.current_job, tProfessional]);

  const fullName = useMemo(() => {
    if (!professional) {
      return 'Marie Dupont';
    }
    const n =
      `${professional.profile.first_name ?? ''} ${professional.profile.last_name ?? ''}`.trim();
    return n || 'Marie Dupont';
  }, [professional]);

  const locationLabel = useMemo(() => {
    if (!professional?.city) {
      return 'Lyon, France';
    }
    return professional.postal_code
      ? `${professional.city}, ${professional.postal_code}`
      : `${professional.city}, France`;
  }, [professional]);

  const experienceYears = professional?.experience_years ?? 8;
  const completion = professional ? computeProfileCompletion(professional) : 70;

  const avatarUrl = professional?.profile.avatar_url ?? null;
  const displaySrc = preview ?? avatarUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const applyAvatar = async () => {
    if (!session?.user?.id || !professional) {
      return;
    }
    setUploading(true);
    try {
      if (pendingFile) {
        if (avatarUrl) {
          await deleteProfilePhoto(avatarUrl);
        }
        const url = await uploadProfilePhoto(pendingFile, session.user.id);
        await updateProfile.mutateAsync({
          updateData: { avatar_url: url },
          userId: session.user.id,
        });
        setPreview(null);
        setPendingFile(null);
        toast.success(t('saveChanges'));
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      toast.error(tCommon('messages.errorSaving'));
    } finally {
      setUploading(false);
    }
  };

  const clearPending = () => {
    setPreview(null);
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openRemoveConfirm = () => {
    setShowRemoveConfirm(true);
  };

  const confirmRemove = async () => {
    if (!session?.user?.id || !professional?.profile.avatar_url) {
      setShowRemoveConfirm(false);
      return;
    }
    setShowRemoveConfirm(false);
    setUploading(true);
    try {
      await deleteProfilePhoto(professional.profile.avatar_url);
      await updateProfile.mutateAsync({
        updateData: { avatar_url: null },
        userId: session.user.id,
      });
      setPreview(null);
      setPendingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success(t('saveChanges'));
    } catch {
      toast.error(tCommon('messages.errorSaving'));
    } finally {
      setUploading(false);
    }
  };

  if (!professional) {
    return null;
  }

  const hasPendingChange = Boolean(pendingFile);

  return (
    <header className='mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
      <div className='flex flex-col gap-6 md:flex-row md:items-center'>
        <div className='flex items-center gap-6'>
          <div className='relative'>
            <input
              accept='image/*'
              className='hidden'
              onChange={handleFileChange}
              ref={fileInputRef}
              type='file'
            />
            {displaySrc ? (
              <Image
                alt=''
                className='size-24 rounded-full border-4 border-[#4A90E2]/10 object-cover lg:size-32'
                height={128}
                src={displaySrc}
                unoptimized
                width={128}
              />
            ) : (
              <div className='flex size-24 items-center justify-center rounded-full border-4 border-[#4A90E2]/10 bg-slate-200 text-2xl font-bold text-slate-500 lg:size-32'>
                {(professional.profile.first_name?.[0] ?? 'M') +
                  (professional.profile.last_name?.[0] ?? 'D')}
              </div>
            )}
            <div
              aria-hidden
              className='pointer-events-none absolute bottom-1 right-1 size-4 rounded-full border-2 border-white bg-green-500'
            />
            <Button
              aria-label={tCommon('label.profileImage')}
              className='absolute bottom-0 right-0 z-10 size-9 rounded-full border-2 border-white bg-[#4A90E2] p-0 shadow-md hover:bg-[#357ABD]'
              onClick={() => fileInputRef.current?.click()}
              size='icon'
              type='button'
            >
              <Camera className='size-4 text-white' />
            </Button>
            {avatarUrl || preview ? (
              <Button
                aria-label={t('psRemovePhotoA11y')}
                className='absolute left-0 top-0 z-10 size-8 rounded-full bg-red-500 p-0 hover:bg-red-600'
                onClick={openRemoveConfirm}
                size='icon'
                type='button'
              >
                <X className='size-4 text-white' />
              </Button>
            ) : null}
            {hasPendingChange ? (
              <div className='absolute -bottom-11 left-0 right-0 flex flex-wrap justify-center gap-2 sm:-bottom-10'>
                <Button
                  className='h-8 text-xs'
                  onClick={clearPending}
                  size='sm'
                  type='button'
                  variant='outline'
                >
                  {tCommon('actions.cancel')}
                </Button>
                <Button
                  className='h-8 bg-[#4A90E2] text-xs hover:opacity-90'
                  disabled={uploading}
                  onClick={applyAvatar}
                  size='sm'
                  type='button'
                >
                  {uploading
                    ? tCommon('messages.saving')
                    : tCommon('actions.save')}
                </Button>
              </div>
            ) : null}
          </div>
          <div className={hasPendingChange ? 'mt-6 sm:mt-4' : ''}>
            <h1 className='text-2xl font-bold lg:text-3xl'>{fullName}</h1>
            <p className='text-lg font-medium text-[#4A90E2]'>{jobLabel}</p>
            <div className='mt-2 flex flex-wrap gap-4 text-sm text-slate-500'>
              <span className='flex items-center gap-1'>
                <MapPin className='size-4' />
                {locationLabel}
              </span>
              <span className='flex items-center gap-1'>
                <Briefcase className='size-4' />
                {t('psExperienceShort', { years: experienceYears })}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        onOpenChange={open => !open && setShowRemoveConfirm(false)}
        open={showRemoveConfirm}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('psRemovePhotoTitle')}</DialogTitle>
            <DialogDescription>
              {t('psRemovePhotoDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2'>
            <Button
              onClick={() => setShowRemoveConfirm(false)}
              type='button'
              variant='outline'
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button
              className='bg-red-600 hover:bg-red-700'
              disabled={uploading}
              onClick={confirmRemove}
              type='button'
            >
              {t('psRemovePhotoConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

function computeProfileCompletion(professional: {
  city: string;
  current_job: null | string;
  description: null | string;
  experience_years: number;
  profile: { first_name: null | string; last_name: null | string };
  skills: null | string[];
}): number {
  let score = 0;
  const max = 10;
  if (professional.profile.first_name) {
    score += 1;
  }
  if (professional.profile.last_name) {
    score += 1;
  }
  if (professional.description?.trim()) {
    score += 2;
  }
  if (professional.current_job) {
    score += 1;
  }
  if (professional.city) {
    score += 1;
  }
  if ((professional.experience_years ?? 0) > 0) {
    score += 1;
  }
  if ((professional.skills?.length ?? 0) >= 2) {
    score += 2;
  }
  if ((professional.skills?.length ?? 0) >= 4) {
    score += 1;
  }
  return Math.min(100, Math.round((score / max) * 100));
}
