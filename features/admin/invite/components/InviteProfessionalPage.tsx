'use client';

import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Loader2,
  Mail,
  Send,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
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

type CsvRow = {
  email: string;
  firstName: string;
  job: string;
  lastName: string;
  phone: string;
};

type BulkResult = {
  email: string;
  error?: string;
  success: boolean;
};

function parseCSV(content: string): CsvRow[] {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Detect delimiter (comma or semicolon)
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';

  // Parse a CSV line handling quoted fields
  function parseLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    return fields;
  }

  // Skip header row
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseLine(line);
    if (fields.length < 1) continue;

    const row: CsvRow = {
      email: fields[0] || '',
      firstName: fields[1] || '',
      job: fields[4] || '',
      lastName: fields[2] || '',
      phone: fields[3] || '',
    };

    // Only include rows with a valid-looking email
    if (row.email && row.email.includes('@')) {
      rows.push(row);
    }
  }

  return rows;
}

function generateTemplateCSV(): string {
  return `email,prenom,nom,telephone,metier
marie@example.com,Marie,Dupont,0612345678,early_childhood_educator
jean@example.com,Jean,Martin,0698765432,pediatric_nurse`;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function InviteProfessionalPage() {
  const t = useTranslations('professional');
  const { userId } = useRole();
  const professionalJobs = useGetProfessionalJobs();
  const inviteMutation = useInviteProfessional();
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  // Bulk invite state
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast.success(`Invitation envoy\u00e9e \u00e0 ${data.email}`);
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

  // CSV file handling
  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Veuillez s\u00e9lectionner un fichier CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const rows = parseCSV(content);
      if (rows.length === 0) {
        toast.error(
          'Aucune ligne valide trouv\u00e9e dans le fichier CSV. V\u00e9rifiez le format.'
        );
        return;
      }
      setCsvRows(rows);
      setCsvFileName(file.name);
      setBulkResults(null);
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFileSelect]
  );

  const clearCsv = useCallback(() => {
    setCsvRows([]);
    setCsvFileName(null);
    setBulkResults(null);
    setBulkProgress({ current: 0, total: 0 });
  }, []);

  const sendBulkInvitations = useCallback(async () => {
    if (!userId || csvRows.length === 0) return;

    setIsSendingBulk(true);
    setBulkResults(null);
    setBulkProgress({ current: 0, total: csvRows.length });

    const results: BulkResult[] = [];

    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i];
      setBulkProgress({ current: i + 1, total: csvRows.length });

      try {
        await inviteMutation.mutateAsync({
          currentJob: row.job || undefined,
          email: row.email,
          firstName: row.firstName || undefined,
          invitedBy: userId,
          lastName: row.lastName || undefined,
        });
        results.push({ email: row.email, success: true });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erreur inconnue';
        results.push({ email: row.email, error: errorMessage, success: false });
      }

      // Small delay to avoid rate limiting
      if (i < csvRows.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setBulkResults(results);
    setIsSendingBulk(false);

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    if (errorCount === 0) {
      toast.success(`${successCount} invitation(s) envoy\u00e9e(s) avec succ\u00e8s`);
    } else {
      toast.warning(
        `${successCount} succ\u00e8s, ${errorCount} erreur(s)`
      );
    }
  }, [userId, csvRows, inviteMutation]);

  const handleDownloadTemplate = useCallback(() => {
    downloadCSV(generateTemplateCSV(), 'modele-invitation-prokid.csv');
  }, []);

  const successCount = bulkResults?.filter((r) => r.success).length ?? 0;
  const errorResults = bulkResults?.filter((r) => !r.success) ?? [];

  return (
    <div className='min-h-screen space-y-6 bg-white p-6 lg:p-10'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          Inviter un professionnel
        </h1>
        <p className='mt-2 text-sm text-gray-600 sm:text-base'>
          Cr\u00e9ez un compte professionnel et envoyez une invitation par email.
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
              <Label htmlFor='firstName'>Pr\u00e9nom</Label>
              <Input
                id='firstName'
                placeholder='Pr\u00e9nom'
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
            <Label htmlFor='phone'>T\u00e9l\u00e9phone</Label>
            <Input
              id='phone'
              placeholder='06 12 34 56 78'
              type='tel'
              {...register('phone')}
            />
          </div>

          {/* Job select */}
          <div className='space-y-2'>
            <Label htmlFor='currentJob'>M\u00e9tier</Label>
            <Select
              onValueChange={(value) => setValue('currentJob', value)}
              value={currentJobValue}
            >
              <SelectTrigger>
                <SelectValue placeholder='S\u00e9lectionner un m\u00e9tier' />
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
              Invitation envoy\u00e9e avec succ\u00e8s \u00e0{' '}
              <span className='font-semibold'>{successEmail}</span>
            </p>
          </div>
        )}
      </div>

      {/* Bulk Invite Card */}
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='mb-6 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100'>
            <FileSpreadsheet className='h-5 w-5 text-purple-600' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>
              Invitation en masse
            </h2>
            <p className='text-sm text-gray-500'>
              Importez un fichier CSV pour inviter plusieurs professionnels.
            </p>
          </div>
        </div>

        {/* Template download */}
        <div className='mb-4'>
          <button
            className='inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800'
            onClick={handleDownloadTemplate}
            type='button'
          >
            <Download className='h-4 w-4' />
            T\u00e9l\u00e9charger le mod\u00e8le CSV
          </button>
        </div>

        {/* File upload area */}
        {csvRows.length === 0 ? (
          <div
            className={cn(
              'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
              isDragging
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className='mx-auto h-8 w-8 text-gray-400' />
            <p className='mt-2 text-sm font-medium text-gray-700'>
              Glissez-d\u00e9posez un fichier CSV ici
            </p>
            <p className='mt-1 text-xs text-gray-500'>
              ou cliquez pour s\u00e9lectionner un fichier
            </p>
            <p className='mt-2 text-xs text-gray-400'>
              Colonnes attendues : email, prenom, nom, telephone, metier
            </p>
            <input
              ref={fileInputRef}
              accept='.csv'
              className='hidden'
              onChange={handleFileInputChange}
              type='file'
            />
          </div>
        ) : (
          <>
            {/* File info & clear */}
            <div className='mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3'>
              <div className='flex items-center gap-2'>
                <FileSpreadsheet className='h-4 w-4 text-gray-500' />
                <span className='text-sm font-medium text-gray-700'>
                  {csvFileName}
                </span>
                <span className='text-sm text-gray-500'>
                  ({csvRows.length} ligne{csvRows.length > 1 ? 's' : ''})
                </span>
              </div>
              <button
                className='rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                disabled={isSendingBulk}
                onClick={clearCsv}
                type='button'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            {/* Preview table */}
            <div className='mb-4 max-h-64 overflow-auto rounded-lg border border-gray-200'>
              <table className='w-full text-sm'>
                <thead className='sticky top-0 bg-gray-50'>
                  <tr className='border-b border-gray-200 text-left'>
                    <th className='px-3 py-2 font-medium text-gray-500'>#</th>
                    <th className='px-3 py-2 font-medium text-gray-500'>
                      Email
                    </th>
                    <th className='px-3 py-2 font-medium text-gray-500'>
                      Pr\u00e9nom
                    </th>
                    <th className='px-3 py-2 font-medium text-gray-500'>
                      Nom
                    </th>
                    <th className='px-3 py-2 font-medium text-gray-500'>
                      T\u00e9l\u00e9phone
                    </th>
                    <th className='px-3 py-2 font-medium text-gray-500'>
                      M\u00e9tier
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {csvRows.map((row, index) => (
                    <tr key={index} className='hover:bg-gray-50'>
                      <td className='px-3 py-2 text-gray-400'>{index + 1}</td>
                      <td className='px-3 py-2 text-gray-900'>{row.email}</td>
                      <td className='px-3 py-2 text-gray-700'>
                        {row.firstName || '-'}
                      </td>
                      <td className='px-3 py-2 text-gray-700'>
                        {row.lastName || '-'}
                      </td>
                      <td className='px-3 py-2 text-gray-700'>
                        {row.phone || '-'}
                      </td>
                      <td className='px-3 py-2 text-gray-700'>
                        {row.job || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Progress bar during sending */}
            {isSendingBulk && (
              <div className='mb-4'>
                <div className='mb-1 flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>
                    Envoi {bulkProgress.current}/{bulkProgress.total}...
                  </span>
                  <span className='text-gray-500'>
                    {Math.round(
                      (bulkProgress.current / bulkProgress.total) * 100
                    )}
                    %
                  </span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                  <div
                    className='h-full rounded-full bg-purple-600 transition-all duration-300'
                    style={{
                      width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Results summary */}
            {bulkResults && (
              <div className='mb-4 space-y-3'>
                {successCount > 0 && (
                  <div className='flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3'>
                    <CheckCircle className='h-4 w-4 flex-shrink-0 text-green-600' />
                    <span className='text-sm text-green-800'>
                      {successCount} invitation{successCount > 1 ? 's' : ''}{' '}
                      envoy\u00e9e{successCount > 1 ? 's' : ''} avec succ\u00e8s
                    </span>
                  </div>
                )}
                {errorResults.length > 0 && (
                  <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                    <div className='mb-2 flex items-center gap-2'>
                      <AlertCircle className='h-4 w-4 flex-shrink-0 text-red-600' />
                      <span className='text-sm font-medium text-red-800'>
                        {errorResults.length} erreur
                        {errorResults.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <ul className='space-y-1 pl-6'>
                      {errorResults.map((result, index) => (
                        <li
                          key={index}
                          className='text-xs text-red-700'
                        >
                          {result.email}: {result.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Send button */}
            <Button
              className='w-full sm:w-auto'
              disabled={isSendingBulk || csvRows.length === 0}
              onClick={sendBulkInvitations}
              type='button'
              variant={bulkResults ? 'outline' : 'default'}
            >
              {isSendingBulk ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Envoi en cours...
                </>
              ) : bulkResults ? (
                <>
                  <Send className='mr-2 h-4 w-4' />
                  Renvoyer les invitations
                </>
              ) : (
                <>
                  <Send className='mr-2 h-4 w-4' />
                  Envoyer {csvRows.length} invitation
                  {csvRows.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </>
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
              Invitations r\u00e9centes
            </h2>
            <p className='text-sm text-gray-500'>
              Professionnels invit\u00e9s en attente de confirmation.
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
