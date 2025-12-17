'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { useGetReport } from '../hooks/useGetReport';
import { ReportForm } from './ReportForm';

export default function ReportEditPage() {
  const { id } = useParams();
  const { data: response } = useGetReport(id as string);
  const tCommon = useTranslations('common');

  if (!response?.report) {
    return <div>{tCommon('messages.notFound')}</div>;
  }

  return (
    <div className='bg-blue-50/30 p-8'>
      <ReportForm isEdit={true} report={response.report} />
    </div>
  );
}
