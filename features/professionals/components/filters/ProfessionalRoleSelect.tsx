'use client';

import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfessionalSkills } from '@/features/professionals/professional.config';

interface ProfessionalRoleSelectProps {
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  open: boolean;
  value: string;
}

export function ProfessionalRoleSelect({
  onOpenChange,
  onValueChange,
  open,
  value,
}: ProfessionalRoleSelectProps) {
  const t = useTranslations('professional');

  return (
    <Select
      onOpenChange={onOpenChange}
      onValueChange={onValueChange}
      open={open}
      value={value}
    >
      <SelectTrigger className='h-9 rounded-xl bg-slate-100 px-4 text-xs font-medium text-slate-800 shadow-none hover:bg-slate-50 data-[state=open]:border-blue-500 data-[state=open]:text-blue-500'>
        <SelectValue placeholder={t('search.role')} />
      </SelectTrigger>
      <SelectContent className='min-w-[240px] rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lg'>
        <SelectItem
          className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-800 data-[state=checked]:bg-blue-50'
          value='all'
        >
          {t('roles.all')}
        </SelectItem>
        {ProfessionalSkills.map(skill => (
          <SelectItem
            className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-800 data-[state=checked]:bg-blue-50'
            key={skill}
            value={skill}
          >
            {t(`jobs.${skill}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
