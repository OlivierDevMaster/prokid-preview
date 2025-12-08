'use client';

import { ArrowLeft, FileText, Link, Paperclip, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { useGetReport } from '../hooks/useGetReport';

export function ReportDetails() {
  const { id } = useParams();
  const t = useTranslations('admin.report');
  const tCommon = useTranslations('common');

  const { data: reportData } = useGetReport(id as string);
  const report = reportData?.report;
  const structure = reportData?.structure;

  if (!report) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {t('notFound')}
          </h1>
          <Link href='/professional'>
            <Button>{t('backToList')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/admin/report'>
            <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
          </Link>
          <h1 className='text-3xl font-bold text-blue-600'>{t('details')}</h1>
        </div>
        <div className='flex gap-3'>
          <Button
            className='border-gray-300 text-gray-700 hover:bg-gray-50'
            type='submit'
            variant='outline'
          >
            <FileText className='mr-2 h-4 w-4' />
            {tCommon('actions.edit')}
          </Button>
          <Button className='bg-blue-500 text-white hover:bg-blue-600'>
            <Send className='mr-2 h-4 w-4' />
            {t('sendEmail')}
          </Button>
        </div>
      </div>

      {/* Form Card */}
      <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='p-8'>
          <div className='grid grid-cols-1 gap-6 pb-4 md:grid-cols-2'>
            <div>
              <h5 className='pb-2 font-bold'>{t('label.title')}</h5>
              <div className='rounded-lg border p-2'>{report?.title ?? ''}</div>
            </div>

            {/* Recipient Structure */}
            <div>
              <h5 className='pb-2 font-bold'>{t('label.structure')}</h5>
              <div className='rounded-lg border p-2'>{structure?.name}</div>
            </div>
          </div>

          {/* Report Content */}
          <div>
            <h5 className='pb-2 font-bold'>{t('label.content')}</h5>
            <div className='rounded-lg border p-2'>{report?.content}</div>
          </div>

          {/* Attachments */}
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-gray-700'>
              {t('attachments')}{' '}
              <span className='text-gray-500'>({t('optional')})</span>
            </label>
            <div className='flex items-center gap-4'>
              <Button
                className='border-gray-300 text-gray-700 hover:bg-gray-50'
                disabled
                type='button'
                variant='outline'
              >
                <Paperclip className='mr-2 h-4 w-4' />
                {t('addFiles')}
              </Button>
              <span className='text-sm text-gray-500'>{t('fileTypes')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
