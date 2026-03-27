'use client';

import { CheckCircle, Loader2, Mail, Send, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useGetProfessionalJobs from '@/features/professionals/hooks/useGetProfessionalJobs';
import { useRole } from '@/hooks/useRole';
import { cn } from '@/lib/utils';

import { useInviteProfessional } from '../hooks/useInviteProfessional';
import {
  getInvitedProfessionals,
  InvitedProfessional,
} from '../invite.service';

type InviteFormData = {
  currentJob: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export function InviteProfessionalPage() {
  const t = useTranslations('professional');
  const { userId } = useRole();
  const professionalJobs = useGetProfessionalJobs();
  const inviteMutation = useInviteProfessional();
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<InviteFormData>({
    defaultValues: {
      currentJob: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const currentJobValue = watch('currentJob');

  const { data: invitedProfessionals = [], isLoading: isLoadingInvited } =
    useQuery<InvitedProfessional[]>({
      queryFn: getInvitedProfessionals,
      queryKey: ['invited-professionals'],
    });

  const onSubmit = async (data: InviteFormData) => {
    if (!userId) return;

    setSuccessEmail(null);

    try {
      await inviteMutation.mutateAsync({
        currentJob: data.currentJob || undefined,
        email: data.email,
        firstName: data.firstName || undefined,
        invitedBy: userId,
        lastName: data.lastName || undefined,
      });

      setSuccessEmail(data.email);
      toast.success(`Invitation envoyée à ${data.email}`);
      reset();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de l'envoi de l'invitation";
      toast.error(errorMessage);
    }
  };

  // Clear success message after 10 seconds
  useEffect(() => {
    if (successEmail) {
      const timer = setTimeout(() => setSuccessEmail(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [successEmail]);

  return (
    <div className='min-h-screen space-y-6 bg-white p-6 lg:p-10'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          Inviter un professionnel
        </h1>
        <p className='mt-2 text-sm text-gray-600 sm:text-base'>
          Créez un compte professionnel et envoyez une invitation par email.
        </p>
      </div>

      {/* Form Card */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100'>
            <UserPlus className='h-5 w-5 text-blue-600' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>
              Nouveau professionnel
            </h2>
            <p className='text-sm text-gray-500'>
              Remplissez les informations pour envoyer l&apos;invitation.
            </p>
          </div>
        </div>

        <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div className='space-y-2'>
            <Label htmlFor='email'>
              Email <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='email'
              placeholder='professionnel@email.com'
              type='email'
              {...register('email', {
                pattern: {
                  message: 'Email invalide',
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                },
                required: "L'email est requis",
              })}
              className={cn(errors.email && 'border-red-500')}
            />
            {errors.email && (
              <p className='text-sm text-red-500'>{errors.email.message}</p>
            )}
          </div>

          {/* First name / Last name row */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>Prénom</Label>
              <Input
                id='firstName'
                placeholder='Prénom'
                {...register('firstName')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lastName'>Nom</Label>
              <Input
                id='lastName'
                placeholder='Nom'
                {...register('lastName')}
              />
            </div>
          </div>

          {/* Phone */}
          <div className='space-y-2'>
            <Label htmlFor='phone'>Téléphone</Label>
            <Input
              id='phone'
              placeholder='06 12 34 56 78'
              type='tel'
              {...register('phone')}
            />
          </div>

          {/* Job select */}
          <div className='space-y-2'>
            <Label htmlFor='currentJob'>Métier</Label>
            <Select
              onValueChange={(value) => setValue('currentJob', value)}
              value={currentJobValue}
            >
              <SelectTrigger>
                <SelectValue placeholder='Sélectionner un métier' />
              </SelectTrigger>
              <SelectContent>
                {professionalJobs.map((job) => (
                  <SelectItem key={job.value} value={job.value}>
                    {job.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            className='w-full sm:w-auto'
            disabled={inviteMutation.isPending}
            type='submit'
          >
            {inviteMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className='mr-2 h-4 w-4' />
                Envoyer l&apos;invitation
              </>
            )}
          </Button>
        </form>

        {/* Success message */}
        {successEmail && (
          <div className='mt-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4'>
            <CheckCircle className='h-5 w-5 flex-shrink-0 text-green-600' />
            <p className='text-sm text-green-800'>
              Invitation envoyée avec succès à{' '}
              <span className='font-semibold'>{successEmail}</span>
            </p>
          </div>
        )}
      </div>

      {/* Recent invitations */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100'>
            <Mail className='h-5 w-5 text-amber-600' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>
              Invitations récentes
            </h2>
            <p className='text-sm text-gray-500'>
              Professionnels invités en attente de confirmation.
            </p>
          </div>
        </div>

        {isLoadingInvited ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
          </div>
        ) : invitedProfessionals.length === 0 ? (
          <div className='rounded-lg border border-dashed border-gray-300 py-8 text-center'>
            <Mail className='mx-auto h-8 w-8 text-gray-400' />
            <p className='mt-2 text-sm text-gray-500'>
              Aucune invitation en attente.
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-200 text-left'>
                  <th className='pb-3 font-medium text-gray-500'>Email</th>
                  <th className='pb-3 font-medium text-gray-500'>Nom</th>
                  <th className='pb-3 font-medium text-gray-500'>Statut</th>
                  <th className='pb-3 font-medium text-gray-500'>Date</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {invitedProfessionals.map((pro) => (
                  <tr key={pro.user_id} className='hover:bg-gray-50'>
                    <td className='py-3 text-gray-900'>{pro.email}</td>
                    <td className='py-3 text-gray-700'>
                      {[pro.first_name, pro.last_name]
                        .filter(Boolean)
                        .join(' ') || '-'}
                    </td>
                    <td className='py-3'>
                      <span className='inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800'>
                        En attente
                      </span>
                    </td>
                    <td className='py-3 text-gray-500'>
                      {new Date(pro.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
