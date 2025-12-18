import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

import { TableActionType } from '@/features/admin/models/table.modele';

export default function useReportTableActions() {
  const t = useTranslations('admin.report');
  const router = useRouter();
  const actions: TableActionType[] = [
    {
      icon: <Eye className='h-4 w-4' />,
      label: t('createReport'),
      onClick: () => {
        router.push('/admin/report/');
      },
    },
  ];

  return actions;
}
