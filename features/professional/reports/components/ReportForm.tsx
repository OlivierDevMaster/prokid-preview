'use client';

import {
  Bold,
  FileText,
  ImageIcon,
  List,
  Paperclip,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo, useRef, useState } from 'react';
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

import { useGetMissionById } from '../hooks/useGetMissionById';
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
  const missions = useMemo(
    () => missionsData?.data ?? [],
    [missionsData?.data]
  );
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
  const [missionIdFromQuery] = useQueryState(
    'mission',
    parseAsString.withDefault('')
  );
  const { data: missionFromQuery } = useGetMissionById(
    missionIdFromQuery || null
  );

  // Include mission from URL in options when not in main list (e.g. pending from chat)
  const displayMissions = useMemo(() => {
    const list = [...missions];
    if (
      missionIdFromQuery &&
      missionFromQuery &&
      !list.some((m: { id: string }) => m.id === missionIdFromQuery)
    ) {
      list.unshift(missionFromQuery as (typeof missions)[0]);
    }
    return list;
  }, [missions, missionIdFromQuery, missionFromQuery]);

  const [hasSetMissionFromQuery, setHasSetMissionFromQuery] = useState(false);

  useEffect(() => {
    if (isEdit && report) {
      form.reset({
        content: report.content,
        id: report.id,
        mission_id: report.mission_id,
        title: report.title,
      });
      setCurrentReport(report);
    } else if (!isEdit && missionIdFromQuery && !hasSetMissionFromQuery) {
      const inList = displayMissions.some(
        (m: { id: string }) => m.id === missionIdFromQuery
      );
      if (inList) {
        form.reset({
          content: '',
          mission_id: missionIdFromQuery,
          title: '',
        });
        setHasSetMissionFromQuery(true);
      }
    }
  }, [
    isEdit,
    report,
    form,
    missionIdFromQuery,
    displayMissions,
    hasSetMissionFromQuery,
  ]);

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
      toast.error(t('messages.cannotDeleteAttachmentsFromSentReports'));
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
            toast.error(t('messages.failedToUploadFiles'));
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
            : t('messages.errorCreatingReport')
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
      toast.error(t('messages.reportAlreadySent'));
      return;
    }

    const formValues = form.getValues();

    // Validate required fields
    if (!formValues.mission_id) {
      toast.error(t('messages.selectMissionBeforeSending'));
      return;
    }
    if (!formValues.title || formValues.title.trim().length === 0) {
      toast.error(t('messages.enterTitleBeforeSending'));
      return;
    }
    if (!formValues.content || formValues.content.trim().length === 0) {
      toast.error(t('messages.enterContentBeforeSending'));
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
        toast.error(t('messages.failedToUploadFiles'));
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

  const isPdf = (name: string) =>
    /\.pdf$/i.test(name) || /\.docx?$/i.test(name);
  const formatFileSize = (bytes: number) =>
    `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <Form {...form}>
      <form className='space-y-8' onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Section: Informations générales */}
        <Card className='border-none bg-white shadow-sm'>
          <div className='px-4 pt-4 sm:px-6'>
            <h2 className='text-sm font-bold uppercase tracking-wider text-gray-500'>
              Informations générales
            </h2>
          </div>
          <div className='space-y-2 px-4 py-5 sm:px-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel className='text-sm font-semibold text-gray-700'>
                      {t('reportTitle')} <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        placeholder='Ex: Intervention de suivi hebdomadaire'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='mission_id'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel className='text-sm font-semibold text-gray-700'>
                      Mission associée <span className='text-red-500'>*</span>
                    </FormLabel>
                    <Select
                      disabled={isEdit && currentReport?.status === 'sent'}
                      onValueChange={value => value && field.onChange(value)}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className='rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20'>
                          <SelectValue
                            placeholder={
                              t('selectMissionPlaceholder') ||
                              'Sélectionner une mission'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {displayMissions.map(mission => {
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
          </div>
        </Card>

        {/* Section: Contenu du rapport + Pièces jointes */}
        <Card className='border-none bg-white shadow-sm'>
          <div className='flex items-center justify-between px-4 pb-3 pt-4 sm:px-6'>
            <h2 className='text-sm font-bold uppercase tracking-wider text-gray-500'>
              Contenu du rapport
            </h2>
          </div>
          <div className='space-y-4 px-4 pb-4 pt-2 sm:px-6 sm:pb-6'>
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className='min-h-[280px] resize-y rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20'
                      placeholder='Décrivez ici le déroulement de la mission, les points observés et les actions entreprises...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pièces jointes */}
            <div className='mt-8 border-t border-gray-100 pt-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-sm font-bold uppercase tracking-wider text-gray-500'>
                  Pièces jointes
                </h2>
                {currentReport?.status !== 'sent' && (
                  <>
                    <input
                      accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                      className='hidden'
                      multiple
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      type='file'
                    />
                    <Button
                      className='flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50'
                      disabled={isLoading}
                      onClick={() => fileInputRef.current?.click()}
                      type='button'
                    >
                      <Paperclip className='h-4 w-4' />
                      Ajouter des pièces jointes
                    </Button>
                  </>
                )}
              </div>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                {selectedFiles.map((file, index) => (
                  <div
                    className='flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3'
                    key={`${file.name}-${index}`}
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded ${
                        isPdf(file.name)
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                      }`}
                    >
                      {isPdf(file.name) ? (
                        <FileText className='h-5 w-5' />
                      ) : (
                        <ImageIcon className='h-5 w-5' />
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {file.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      className='p-1 text-gray-500 hover:text-red-500'
                      onClick={() => handleRemoveFile(index)}
                      size='icon'
                      type='button'
                      variant='ghost'
                    >
                      <X className='h-5 w-5' />
                    </Button>
                  </div>
                ))}
                {currentReport?.attachments?.map(attachment => (
                  <div
                    className='flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3'
                    key={attachment.id}
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded ${
                        /\.(pdf|docx?)$/i.test(attachment.file_name)
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                      }`}
                    >
                      {/\.(pdf|docx?)$/i.test(attachment.file_name) ? (
                        <FileText className='h-5 w-5' />
                      ) : (
                        <ImageIcon className='h-5 w-5' />
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {attachment.file_name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatFileSize(attachment.file_size)}
                      </p>
                    </div>
                    {currentReport?.status !== 'sent' && (
                      <Button
                        className='p-1 text-gray-500 hover:text-red-500'
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        size='icon'
                        type='button'
                        variant='ghost'
                      >
                        <Trash2 className='h-5 w-5' />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className='mt-8 flex flex-wrap items-center justify-end gap-4'>
              {(!isEdit || currentReport?.status !== 'sent') && (
                <Button
                  className='rounded-full border-gray-200 font-semibold text-gray-700 shadow-sm hover:bg-gray-50'
                  disabled={isLoading || isUpdating}
                  type='submit'
                  variant='outline'
                >
                  {t('saveDraft')}
                </Button>
              )}
              {currentReport?.status !== 'sent' && (
                <Button
                  className='flex items-center gap-2 rounded-full bg-blue-600 px-8 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700'
                  disabled={isLoading || isSending}
                  onClick={handleSendReport}
                  type='button'
                >
                  {isSending ? t('sending') : 'Envoyer le rapport'}
                  <Send className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </form>
    </Form>
  );
}
