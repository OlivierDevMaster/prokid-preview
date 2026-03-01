'use client';

import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProfessionalAvailabilitySelectProps {
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  open: boolean;
  value: string;
}

export function ProfessionalAvailabilitySelect({
  onOpenChange,
  onValueChange,
  open,
  value,
}: ProfessionalAvailabilitySelectProps) {
  const t = useTranslations('professional');

  return (
    <Select
      onOpenChange={onOpenChange}
      onValueChange={onValueChange}
      open={open}
      value={value}
    >
      <SelectTrigger>
        <SelectValue placeholder={t('search.availability')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>{t('availability.all')}</SelectItem>
        <SelectItem value='morning'>{t('availability.morning')}</SelectItem>
        <SelectItem value='afternoon'>{t('availability.afternoon')}</SelectItem>
        <SelectItem value='fullDay'>{t('availability.fullDay')}</SelectItem>
        <SelectItem value='weekend'>{t('availability.weekend')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
