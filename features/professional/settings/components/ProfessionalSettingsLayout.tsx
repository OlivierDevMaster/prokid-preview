'use client';

import { ChevronRight, Loader2, Search, Shield, Sparkles, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import BillingTabContent from '@/features/professional/settings/components/BillingTabContent';
import CertificationsSection from '@/features/professional/settings/components/CertificationsSection';
import ExperiencesSection from '@/features/professional/settings/components/ExperiencesSection';
import ReceivedReviewsSection from '@/features/professional/settings/components/ReceivedReviewsSection';
import RecommendationsPlaceholder from '@/features/professional/settings/components/RecommendationsPlaceholder';
import { IdentifiersForm } from '@/features/professional/settings/components/IdentifiersForm';
import { NotificationPreferences } from '@/features/professional/settings/components/NotificationPreferences';
import { PasswordChangeForm } from '@/features/professional/settings/components/PasswordChangeForm';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { useUpdateProfessional } from '@/features/professionals/hooks/useUpdateProfessional';
import { cn } from '@/lib/utils';

import { PersonalContactSection } from './PersonalContactSection';
import PersonalInfoSection from './PersonalInfoSection';
import { ProfileSummaryHeader } from './ProfileSummaryHeader';

const MOCK_SKILLS_FALLBACK = [
  'Développement moteur',
  'Éveil sensoriel',
  'Communication non-verbale',
  'Accompagnement parental',
  'Motricité libre',
];

export function ProfessionalSettingsLayout() {
  const t = useTranslations('admin.setting');
  const { data: session } = useSession();
  const userId = session?.user?.id ?? '';
  const { data: professional, isLoading } = useFindProfessional(userId);
  const updateProfessional = useUpdateProfessional();

  const [skillInput, setSkillInput] = useState('');
  const [dialog, setDialog] = useState<
    'billing' | 'email' | 'notifications' | 'password' | null
  >(null);

  const skillsList = useMemo(() => {
    if (professional?.skills?.length) {
      return professional.skills;
    }
    return MOCK_SKILLS_FALLBACK;
  }, [professional?.skills]);

  const handleAddSkill = async () => {
    const s = skillInput.trim();
    if (!s || !userId) {
      return;
    }
    const next = [...new Set([s, ...skillsList])];
    try {
      await updateProfessional.mutateAsync({
        professionalId: userId,
        updateData: { skills: next },
      });
      setSkillInput('');
      toast.success(t('saveChanges'));
    } catch {
      toast.error(t('loading'));
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    if (!userId) {
      return;
    }
    const next = skillsList.filter(x => x !== skill);
    try {
      await updateProfessional.mutateAsync({
        professionalId: userId,
        updateData: { skills: next },
      });
    } catch {
      toast.error(t('loading'));
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
      </div>
    );
  }

  if (!professional || !userId) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f6f6f8] text-slate-900'>
      <div className='mx-auto max-w-7xl p-6 lg:p-10'>
        <ProfileSummaryHeader />

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          <div className='space-y-8 lg:col-span-2'>
            <PersonalContactSection />

            <PersonalInfoSection />

            <section className='rounded-xl bg-white p-6 shadow-sm'>
              <h2 className='mb-6 flex items-center gap-2 text-xl font-bold'>
                <Sparkles className='size-6 text-blue-600' />
                {t('psSkillsTitle')}
              </h2>
              <div className='mb-8 flex flex-col gap-2 sm:flex-row'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
                  <Input
                    className='h-10 rounded-xl border-slate-200 bg-slate-50 pl-10 focus-visible:ring-blue-600/20'
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder={t('psAddSkillPlaceholder')}
                    value={skillInput}
                  />
                </div>
                <Button
                  className='h-10 rounded-xl bg-blue-600 font-semibold hover:bg-blue-700'
                  disabled={updateProfessional.isPending}
                  onClick={handleAddSkill}
                  type='button'
                >
                  {t('psAdd')}
                </Button>
              </div>
              <h3 className='mb-4 text-sm font-bold uppercase tracking-wider text-slate-400'>
                {t('psVerifiedSkills')}
              </h3>
              <div className='flex flex-wrap gap-3'>
                {skillsList.map(skill => (
                  <span
                    className='flex items-center gap-2 rounded-full border border-slate-200/50 bg-[#CDEAE1] px-3 py-1.5 text-sm font-medium text-slate-700'
                    key={skill}
                  >
                    {skill}
                    <button
                      aria-label='Remove'
                      className='text-slate-500 hover:text-slate-800'
                      onClick={() => handleRemoveSkill(skill)}
                      type='button'
                    >
                      <X className='size-4' />
                    </button>
                  </span>
                ))}
              </div>
            </section>

            <ExperiencesSection />
            <CertificationsSection />
            <ReceivedReviewsSection />
            <RecommendationsPlaceholder />
          </div>

          <div className='space-y-8'>
            <section className='rounded-xl bg-white p-6 shadow-sm'>
              <h2 className='mb-4 flex items-center gap-2 text-lg font-bold'>
                <Shield className='size-5 text-blue-600' />
                {t('psAccountSecurity')}
              </h2>
              <div className='space-y-3'>
                {(
                  [
                    ['email', t('psModifyEmail')],
                    ['password', t('psChangePassword')],
                    ['notifications', t('psNotifications')],
                    ['billing', t('psBilling')],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-slate-50'
                    )}
                    key={key}
                    onClick={() => setDialog(key)}
                    type='button'
                  >
                    <span>{label}</span>
                    <ChevronRight className='size-4 text-slate-400' />
                  </button>
                ))}
              </div>
            </section>

          </div>
        </div>

        <footer className='mt-12 border-t border-slate-200 py-8 text-center'>
          <p className='text-sm font-medium text-slate-400'>
            {t('psFooter', { year: new Date().getFullYear() })}
          </p>
        </footer>
      </div>

      <Dialog
        onOpenChange={open => !open && setDialog(null)}
        open={dialog === 'email'}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('psDialogEmail')}</DialogTitle>
          </DialogHeader>
          <IdentifiersForm minimalDialog />
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={open => !open && setDialog(null)}
        open={dialog === 'password'}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('psDialogPassword')}</DialogTitle>
          </DialogHeader>
          <PasswordChangeForm minimalDialog />
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={open => !open && setDialog(null)}
        open={dialog === 'notifications'}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('psDialogNotifications')}</DialogTitle>
          </DialogHeader>
          <NotificationPreferences minimalDialog />
        </DialogContent>
      </Dialog>

      <Sheet
        onOpenChange={open => !open && setDialog(null)}
        open={dialog === 'billing'}
      >
        <SheetContent
          className='flex w-full flex-col overflow-y-auto sm:max-w-2xl'
          side='right'
        >
          <SheetHeader>
            <SheetTitle>{t('psDialogBilling')}</SheetTitle>
          </SheetHeader>
          <div className='mt-6 flex-1'>
            <BillingTabContent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
