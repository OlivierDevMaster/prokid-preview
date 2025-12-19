'use client';

import { format } from 'date-fns';
import { FileText, Paperclip, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useGetReport } from '../hooks/useGetReport';

interface ReportDetailsDialogProps {
  isLoading: boolean;
  onClose: () => void;
  open: boolean;
  reportId: null | string;
}

export function ReportDetailsDialog({
  isLoading,
  onClose,
  open,
  reportId,
}: ReportDetailsDialogProps) {
  const t = useTranslations('admin.report');
  const tReports = useTranslations('admin.reports');
  const tCommon = useTranslations('common');

  const { data: reportData, isLoading: isLoadingReport } =
    useGetReport(reportId);
  const report = reportData?.report;

  const isLoadingData = isLoading || isLoadingReport;

  const professionalName = report?.author?.profile
    ? `${report.author.profile.first_name || ''} ${report.author.profile.last_name || ''}`.trim() ||
      report.author.profile.email ||
      'Unknown'
    : 'Unknown';

  const professionalEmail = report?.author?.profile?.email;

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className='flex max-h-[90vh] max-w-4xl flex-col'>
        {isLoadingData ? (
          <div className='py-8 text-center text-gray-600'>
            {tCommon('messages.loading')}
          </div>
        ) : !report ? (
          <div className='py-8 text-center text-gray-600'>
            {tCommon('messages.notFound')}
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-200'>
                  <FileText className='h-5 w-5 text-white' />
                </div>
                <div className='flex-1'>
                  <DialogTitle>{report.title}</DialogTitle>
                  <DialogDescription>
                    {t('details') || 'Report details'}
                  </DialogDescription>
                </div>
                {report.status && (
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
            </DialogHeader>

            <div className='my-4 max-h-[60vh] space-y-4 overflow-y-auto px-1'>
              {/* Professional Information */}
              <Card className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                <h3 className='mb-3 text-sm font-semibold text-gray-700'>
                  Professional
                </h3>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <User className='h-4 w-4 text-gray-400' />
                    <span>{professionalName}</span>
                  </div>
                  {professionalEmail && (
                    <div className='text-sm text-gray-600'>
                      {professionalEmail}
                    </div>
                  )}
                </div>
              </Card>

              {/* Report Information */}
              <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
                <div className='p-6'>
                  <div className='grid grid-cols-1 gap-6 pb-4 md:grid-cols-2'>
                    <div>
                      <h5 className='pb-2 font-bold text-gray-700'>
                        {t('label.title')}
                      </h5>
                      <div className='rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900'>
                        {report.title ?? ''}
                      </div>
                    </div>

                    {/* Mission */}
                    <div>
                      <h5 className='pb-2 font-bold text-gray-700'>
                        {t('label.mission') || 'Mission'}
                      </h5>
                      <div className='rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900'>
                        {report.mission?.title || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div>
                    <h5 className='pb-2 font-bold text-gray-700'>
                      {t('label.content')}
                    </h5>
                    <div className='whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900'>
                      {report.content}
                    </div>
                  </div>

                  {/* Created At */}
                  {report.created_at && (
                    <div className='mt-4'>
                      <h5 className='pb-2 font-bold text-gray-700'>
                        {tReports('createdAt') || 'Created at'}
                      </h5>
                      <div className='text-sm text-gray-600'>
                        {format(
                          new Date(report.created_at),
                          'dd/MM/yyyy HH:mm'
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {report.attachments && report.attachments.length > 0 && (
                    <div className='mt-4 space-y-2'>
                      <label className='text-sm font-semibold text-gray-700'>
                        {t('attachments')}
                      </label>
                      <div className='space-y-2'>
                        {report.attachments.map(attachment => (
                          <div
                            className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3'
                            key={attachment.id}
                          >
                            <Paperclip className='h-4 w-4 text-gray-400' />
                            <span className='text-sm text-gray-700'>
                              {attachment.filename || attachment.file_path}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <DialogFooter>
              <Button onClick={onClose} variant='outline'>
                {tCommon('actions.cancel') || 'Close'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
