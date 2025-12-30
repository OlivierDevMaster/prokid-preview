'use client';

import {
  ArrowLeft,
  FileText,
  Link,
  Paperclip,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUploadReportAttachment } from '@/features/report-attachments';
import { useDeleteReportAttachment } from '@/features/report-attachments/hooks/useDeleteReportAttachment';
import { useSendReport } from '@/features/reports/hooks/useSendReport';
import { useUpdateReport } from '@/features/reports/hooks/useUpdateReport';
import { Report } from '@/features/reports/report.model';
import { useRouter } from '@/i18n/routing';

import { useGetMissions } from '../hooks/useGetMissions';
import { useReportForm } from '../hooks/useReportForm';

type ReportFormProps = {
  isEdit?: boolean;
  report?: Report;
};

export function ReportForm({ isEdit = false, report }: ReportFormProps) {
  const t = useTranslations('admin.report');
  const { form, isLoading, onSubmit, submitReport } = useReportForm();
  const router = useRouter();
  const { data: missionsData } = useGetMissions();
  const missions = missionsData?.data ?? [];
  const { isPending: isSending, mutate: sendReport } = useSendReport();
  const { isPending: isUpdating, mutate: updateReport } = useUpdateReport();
  const { mutate: deleteAttachment } = useDeleteReportAttachment();
  const { mutate: uploadAttachment } = useUploadReportAttachment();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentReport, setCurrentReport] = useState<null | Report>(
    report || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleSubmit, setValue } = form;
  useEffect(() => {
    if (isEdit && report) {
      form.reset({
        content: report.content,
        id: report.id,
        mission_id: report.mission_id,
        title: report.title,
      });
      setCurrentReport(report);
    }
  }, [isEdit, report, form]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate file sizes (10MB max per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validFiles = files.filter(file => {
        if (file.size > maxSize) {
          toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
          return false;
        }
        return true;
      });
      setSelectedFiles(prev => {
        const updatedFiles = [...prev, ...validFiles];
        setValue('files', updatedFiles);
        return updatedFiles;
      });
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (currentReport?.status === 'sent') {
      toast.error('Cannot delete attachments from sent reports');
      return;
    }
    deleteAttachment(attachmentId);
  };

  const handleUploadFiles = async (reportId: string, filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;

    // Upload files one by one (since useUploadReportAttachment only accepts one file)
    for (const file of filesToUpload) {
      try {
        await new Promise<void>((resolve, reject) => {
          uploadAttachment(
            { file, reportId },
            {
              onError: error => reject(error),
              onSuccess: () => resolve(),
            }
          );
        });
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    }
    // Clear selected files after successful upload
    setSelectedFiles([]);
  };

  const handleFormSubmit = async () => {
    // If editing an existing report, use update instead of create
    if (isEdit && currentReport?.id) {
      const formValues = form.getValues();
      try {
        const updatedReport = await new Promise<Report>((resolve, reject) => {
          updateReport(
            {
              reportId: currentReport.id,
              updateData: {
                content: formValues.content,
                mission_id: formValues.mission_id,
                title: formValues.title,
              },
            },
            {
              onError: error => reject(error),
              onSuccess: report => resolve(report),
            }
          );
        });

        // Upload any pending files
        if (selectedFiles.length > 0) {
          try {
            await handleUploadFiles(updatedReport.id, selectedFiles);
          } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Failed to upload some files. Please try again.');
            return;
          }
        }

        setCurrentReport(updatedReport);
        toast.success(t('messages.reportSavedSuccessfully'));
        router.push('/professional/reports');
      } catch (error) {
        console.error('Error updating report:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : t('messages.errorCreatingReport') || 'Failed to update report'
        );
      }
    } else {
      // Create new report
      await onSubmit();
      toast.success(t('messages.reportSavedSuccessfully'));
      router.push('/professional/reports');
    }
  };

  const handleSendReport = async () => {
    // Block if report is already sent
    if (currentReport?.status === 'sent') {
      toast.error('This report has already been sent');
      return;
    }

    const formValues = form.getValues();

    // Validate required fields
    if (!formValues.mission_id) {
      toast.error('Please select a mission before sending');
      return;
    }
    if (!formValues.title || formValues.title.trim().length === 0) {
      toast.error('Please enter a title before sending');
      return;
    }
    if (!formValues.content || formValues.content.trim().length === 0) {
      toast.error('Please enter content before sending');
      return;
    }

    let reportId: string;

    // If report doesn't exist yet, create it first
    if (!currentReport?.id) {
      try {
        const result = await submitReport(formValues);
        setCurrentReport(result);
        reportId = result.id;
      } catch (error) {
        console.error('Error creating report:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : t('messages.errorCreatingReport') || 'Failed to create report'
        );
        return;
      }
    } else {
      // Report exists, save any pending changes before sending
      const hasChanges =
        formValues.title !== currentReport.title ||
        formValues.content !== currentReport.content ||
        formValues.mission_id !== currentReport.mission_id;

      if (hasChanges) {
        try {
          const updatedReport = await new Promise<Report>((resolve, reject) => {
            updateReport(
              {
                reportId: currentReport.id,
                updateData: {
                  content: formValues.content,
                  mission_id: formValues.mission_id,
                  title: formValues.title,
                },
              },
              {
                onError: error => reject(error),
                onSuccess: report => resolve(report),
              }
            );
          });
          setCurrentReport(updatedReport);
          reportId = updatedReport.id;
        } catch (error) {
          console.error('Error updating report:', error);
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to save changes before sending'
          );
          return;
        }
      } else {
        reportId = currentReport.id;
      }
    }

    // Upload any pending files before sending
    if (selectedFiles.length > 0) {
      try {
        await handleUploadFiles(reportId, selectedFiles);
      } catch (error) {
        console.error('Error uploading files:', error);
        toast.error('Failed to upload some files. Please try again.');
        return;
      }
    }

    // Then send the report
    sendReport(reportId, {
      onError: error => {
        toast.error(
          error instanceof Error
            ? error.message
            : t('emailSendError') || 'Failed to send email'
        );
      },
      onSuccess: () => {
        toast.success(t('emailSentSuccessfully') || 'Email sent successfully');
        // Refresh to show updated status
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
    });
  };

  return (
    <Form {...form}>
      <form className='space-y-6' onSubmit={handleSubmit(handleFormSubmit)}>
        <div className='space-y-6'>
          {/* Header */}
          <div className='flex flex-col items-center justify-between md:flex-row'>
            <div className='flex items-center gap-3'>
              <Link href='/professional/reports'>
                <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
              </Link>
              <h1 className='text-3xl font-bold text-blue-600'>
                {isEdit ? t('editReport') : t('newReport')}
              </h1>
            </div>
            <div className='mt-4 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:gap-3'>
              {(!isEdit || currentReport?.status !== 'sent') && (
                <Button
                  className='border-gray-300 text-gray-700 hover:bg-gray-50'
                  disabled={isLoading || isUpdating}
                  type='submit'
                  variant='outline'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  {t('saveDraft')}
                </Button>
              )}
              {currentReport?.status !== 'sent' && (
                <Button
                  className='bg-blue-500 text-white hover:bg-blue-600'
                  disabled={isLoading || isSending}
                  onClick={handleSendReport}
                  type='button'
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
              <h2 className='mb-6 text-2xl font-bold text-gray-800'>
                {isEdit ? t('editReport') : t('newReport')}
              </h2>
              {/* Title Section */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-semibold text-gray-700'>
                        {t('reportTitle')}{' '}
                        <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('customTitlePlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mission Selection */}
                <FormField
                  control={form.control}
                  name='mission_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-semibold text-gray-700'>
                        {t('selectMission') || 'Mission'}{' '}
                        <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select
                        disabled={isEdit && currentReport?.status === 'sent'}
                        onValueChange={async value => {
                          field.onChange(value);
                          // await handleMissionChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                t('selectMissionPlaceholder') ||
                                'Select a mission'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {missions.map(mission => {
                            const missionWithStructure = mission as {
                              id: string;
                              structure?: {
                                name?: string;
                                profile?: { email?: string };
                              };
                              title: string;
                            };
                            const structureName =
                              missionWithStructure.structure?.name ||
                              missionWithStructure.structure?.profile?.email ||
                              'N/A';
                            return (
                              <SelectItem
                                key={missionWithStructure.id}
                                value={missionWithStructure.id}
                              >
                                {missionWithStructure.title} - {structureName}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Report Content */}
              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-semibold text-gray-700'>
                      {t('reportContent')}{' '}
                      <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className='min-h-[300px] resize-y'
                        placeholder={t('contentPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <div className='mt-2 text-sm text-gray-600'>
                      <p className='mb-2 font-medium'>
                        {t('exampleStructure')}
                      </p>
                      <ul className='list-inside list-disc space-y-1 text-gray-500'>
                        <li>{t('example1')}</li>
                        <li>{t('example2')}</li>
                        <li>{t('example3')}</li>
                        <li>{t('example4')}</li>
                        <li>{t('example5')}</li>
                      </ul>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachments */}
              <div className='space-y-4'>
                <label className='text-sm font-semibold text-gray-700'>
                  {t('attachments')}{' '}
                  <span className='text-gray-500'>({t('optional')})</span>
                </label>

                {/* File Input */}
                {currentReport?.status !== 'sent' && (
                  <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
                    <input
                      accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                      className='hidden'
                      multiple
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      type='file'
                    />
                    <Button
                      className='border-gray-300 text-gray-700 hover:bg-gray-50'
                      disabled={isLoading}
                      onClick={() => fileInputRef.current?.click()}
                      type='button'
                      variant='outline'
                    >
                      <Paperclip className='mr-2 h-4 w-4' />
                      {t('addFiles')}
                    </Button>
                    <span className='text-sm text-gray-500'>
                      {t('fileTypes')}
                    </span>
                  </div>
                )}

                {/* Selected Files (Pending Upload) */}
                {selectedFiles.length > 0 && (
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>
                      Files to upload:
                    </p>
                    <div className='space-y-2'>
                      {selectedFiles.map((file, index) => (
                        <div
                          className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3'
                          key={`${file.name}-${index}`}
                        >
                          <div className='flex min-w-0 flex-1 items-center gap-2'>
                            <Paperclip className='h-4 w-4 flex-shrink-0 text-gray-500' />
                            <span className='max-w-[120px] truncate text-sm text-gray-700 sm:max-w-none sm:overflow-visible sm:whitespace-normal'>
                              {file.name}
                            </span>
                            <span className='hidden flex-shrink-0 text-xs text-gray-500 sm:inline'>
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            className='h-8 w-8 p-0 text-red-500 hover:bg-red-50'
                            onClick={() => handleRemoveFile(index)}
                            type='button'
                            variant='ghost'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Attachments */}
                {currentReport?.attachments &&
                  currentReport.attachments.length > 0 && (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>
                        Current attachments:
                      </p>
                      <div className='space-y-2'>
                        {currentReport.attachments.map(attachment => (
                          <div
                            className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3'
                            key={attachment.id}
                          >
                            <div className='flex items-center gap-2'>
                              <Paperclip className='h-4 w-4 text-gray-500' />
                              <span className='text-sm text-gray-700'>
                                {attachment.file_name}
                              </span>
                              <span className='text-xs text-gray-500'>
                                (
                                {(attachment.file_size / 1024 / 1024).toFixed(
                                  2
                                )}{' '}
                                MB)
                              </span>
                            </div>
                            {currentReport?.status !== 'sent' && (
                              <Button
                                className='h-8 w-8 p-0 text-red-500 hover:bg-red-50'
                                onClick={() =>
                                  handleRemoveAttachment(attachment.id)
                                }
                                type='button'
                                variant='ghost'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </Card>
        </div>
      </form>
    </Form>
  );
}
