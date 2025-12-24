'use client';

import { ArrowLeft, Download, FileText, Paperclip, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getReportAttachmentDownloadUrl } from '@/features/report-attachments/report-attachment.service';
import { useSendReport } from '@/features/reports/hooks/useSendReport';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';

import { useGetReport } from '../hooks/useGetReport';

export function ReportDetails() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations('admin.report');
  const tCommon = useTranslations('common');

  const { data: reportData, isLoading } = useGetReport(id as string);
  const report = reportData?.report;
  const { isPending: isSending, mutate: sendReport } = useSendReport();
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<
    null | string
  >(null);

  const handleDownloadAttachment = async (
    attachmentId: string,
    fileName: string
  ) => {
    try {
      setDownloadingAttachmentId(attachmentId);
      const downloadUrl = await getReportAttachmentDownloadUrl(attachmentId);

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : tCommon('messages.error') || 'Failed to download attachment'
      );
    } finally {
      setDownloadingAttachmentId(null);
    }
  };

  const handleSendEmail = () => {
    if (!report?.id) return;
    sendReport(report.id, {
      onError: error => {
        toast.error(
          error instanceof Error
            ? error.message
            : t('emailSendError') || 'Failed to send email'
        );
      },
      onSuccess: () => {
        toast.success(t('emailSentSuccessfully') || 'Email sent successfully');
        router.refresh();
      },
    });
  };

  if (isLoading) {
    return <div>{tCommon('messages.loading')}</div>;
  }

  if (!report) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {tCommon('messages.notFound')}
          </h1>
          <Link href='/professional'>
            <Button variant='outline'>{t('backToList')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen space-y-6 bg-blue-50/30 p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/professional/reports'>
            <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
          </Link>
          <div className='flex items-center gap-3'>
            <h1 className='text-3xl font-bold text-blue-600'>{t('details')}</h1>
            {report?.status && (
              <Badge
                className={
                  report.status === 'sent'
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-500 text-white'
                }
                variant='default'
              >
                {report.status === 'sent'
                  ? t('status.sent') || 'Sent'
                  : t('status.draft') || 'Draft'}
              </Badge>
            )}
          </div>
        </div>
        <div className='flex gap-3'>
          {report?.status !== 'sent' && (
            <Button
              className='border-gray-300 text-gray-700 hover:bg-gray-50'
              onClick={() => {
                router.push(`/professional/reports/${id}/edit`);
              }}
              variant='outline'
            >
              <FileText className='mr-2 h-4 w-4' />
              {tCommon('actions.edit')}
            </Button>
          )}
          {report?.status !== 'sent' && (
            <Button
              className='bg-blue-500 text-white hover:bg-blue-600'
              disabled={isSending}
              onClick={handleSendEmail}
            >
              <Send className='mr-2 h-4 w-4' />
              {isSending ? t('sending') || 'Sending...' : t('sendEmail')}
            </Button>
          )}
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

            {/* Mission */}
            <div>
              <h5 className='pb-2 font-bold'>
                {t('label.mission') || 'Mission'}
              </h5>
              <div className='rounded-lg border p-2'>
                {report?.mission?.title || 'N/A'}
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div>
            <h5 className='pb-2 font-bold'>{t('label.content')}</h5>
            <div className='rounded-lg border p-2'>{report?.content}</div>
          </div>

          {/* Attachments */}
          <div className='mt-4 space-y-2'>
            <h5 className='pb-2 font-bold'>{t('attachments')}</h5>
            {report.attachments && report.attachments.length > 0 ? (
              <div className='space-y-2'>
                {report.attachments.map(attachment => (
                  <button
                    className='flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
                    disabled={downloadingAttachmentId === attachment.id}
                    key={attachment.id}
                    onClick={() =>
                      handleDownloadAttachment(
                        attachment.id,
                        attachment.file_name || attachment.file_path
                      )
                    }
                    type='button'
                  >
                    <Paperclip className='h-4 w-4 flex-shrink-0 text-gray-400' />
                    <span className='flex-1 text-sm text-gray-700'>
                      {attachment.file_name || attachment.file_path}
                    </span>
                    {downloadingAttachmentId === attachment.id ? (
                      <span className='text-xs text-gray-500'>
                        {tCommon('messages.loading') || 'Loading...'}
                      </span>
                    ) : (
                      <Download className='h-4 w-4 flex-shrink-0 text-gray-400' />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className='text-sm text-gray-500'>
                {t('noAttachments') || 'No attachments'}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
