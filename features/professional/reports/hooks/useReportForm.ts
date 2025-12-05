'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';

import {
  type ReportFormData,
  reportFormSchema,
} from '../schemas/report.schema';
import { createUserReport } from '../services/report.service';

export function useReportForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<ReportFormData>({
    defaultValues: {
      content: '',
      recipient_id: '',
      title: '',
    },
    resolver: zodResolver(reportFormSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('Utilisateur non authentifié');
      }

      // Create report object - author_id will be set by the edge function
      // The edge function uses the authenticated user from the token
      return createUserReport({
        author_id: session.user.id, // Will be overridden by edge function, but kept for type safety
        content: data.content,
        recipient_id: data.recipient_id,
        title: data.title,
      });
    },
    onError: error => {
      console.error('Error creating report:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la création du rapport'
      );
    },
    onSuccess: data => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['reports'] });
        toast.success('Rapport créé avec succès');
        router.push('/admin/report');
      } else {
        toast.error('Impossible de créer le rapport');
      }
    },
  });

  const onSubmit = form.handleSubmit(data => {
    console.info({ data });
    mutation.mutate(data);
  });

  return {
    form,
    isLoading: mutation.isPending,
    onSubmit,
  };
}
