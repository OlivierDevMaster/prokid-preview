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
      <SelectTrigger>
        <SelectValue placeholder={t('search.role')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>{t('roles.all')}</SelectItem>
        {ProfessionalSkills.map(skill => (
          <SelectItem key={skill} value={skill}>
            {t(`jobs.${skill}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
