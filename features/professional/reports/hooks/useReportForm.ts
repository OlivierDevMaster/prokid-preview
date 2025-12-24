'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import type { Report, ReportInsert } from '@/features/reports/report.model';

import { useUploadReportAttachment } from '@/features/report-attachments';
import { useCreateReport } from '@/features/reports/hooks';
import { createClient } from '@/lib/supabase/client';

import {
  type ReportFormData,
  reportFormSchema,
} from '../schemas/report.schema';

export function useReportForm() {
  const t = useTranslations('admin');

  const form = useForm<ReportFormData>({
    defaultValues: {
      content: '',
      mission_id: '',
      title: '',
    },
    resolver: zodResolver(reportFormSchema),
  });

  const sendReportMutation = useCreateReport();
  const { mutate: uploadAttachment } = useUploadReportAttachment();

  const handleUploadFiles = async (reportId: string, selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    // Upload files one by one (since useUploadReportAttachment only accepts one file)
    for (const file of selectedFiles) {
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
      }
    }
  };

  const submitReport = async (data: ReportFormData): Promise<Report> => {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      throw new Error(t('report.messages.unauthenticated'));
    }

    const authorId = session.user.id;
    // Exclude id and files from insert data to prevent duplicate key errors
    const { files, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...restWithoutId } = rest;
    const parsedData: ReportInsert = {
      ...restWithoutId,
      author_id: authorId,
      status: 'draft',
    };

    const result = await sendReportMutation.mutateAsync(parsedData);

    if (files && files.length > 0) {
      await handleUploadFiles(result.id, files);
    }

    return result;
  };

  const onSubmit = form.handleSubmit(submitReport);

  return {
    form,
    handleUploadFiles,
    isLoading: sendReportMutation.isPending,
    onSubmit,
    submitReport,
  };
}
