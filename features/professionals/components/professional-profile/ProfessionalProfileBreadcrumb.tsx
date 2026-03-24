'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { Link } from '@/i18n/routing';

type ProfessionalProfileBreadcrumbProps = {
  professionalId: string;
};

export function ProfessionalProfileBreadcrumb({
  professionalId,
}: ProfessionalProfileBreadcrumbProps) {
  const t = useTranslations('professional.profile');
  const { data: professional } = useFindProfessional(professionalId);

  const firstName = professional?.profile.first_name ?? '';
  const lastName = professional?.profile.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || '—';

  return (
    <nav
      aria-label='Breadcrumb'
      className='mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500'
    >
      <Link
        className='font-medium text-[#4A90E2] underline-offset-2 hover:underline'
        href='/structure/search'
      >
        {t('searchBreadcrumb')}
      </Link>
      <ChevronRight className='size-4 shrink-0 text-slate-400' />
      <span className='font-medium text-slate-900'>{fullName}</span>
    </nav>
  );
}
