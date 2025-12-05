'use client';

import { ArrowLeft, FileText, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';

import { ReportForm } from './ReportForm';

export function ReportCreatePage() {
  const t = useTranslations('admin.report');

  // TODO: Fetch structures from API/service
  const structures = [
    { id: 'mam-soleil', name: 'MAM Soleil' },
    { id: 'structure2', name: t('structure2') },
    { id: 'structure3', name: t('structure3') },
  ];

  return <ReportForm structures={structures} />;
}
