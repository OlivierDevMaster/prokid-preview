import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { TableActionType } from '../../models/table.modele';

export default function useReportTableHeaderActions(): TableActionType[] {
  const t = useTranslations('admin.report');
  const router = useRouter();
  const actions: TableActionType[] = [
    {
      icon: <Plus className='h-4 w-4' />,
      label: t('createReport'),
      onClick: () => {
        router.push('/admin/report/new');
      },
    },
  ];

  return actions;
}
