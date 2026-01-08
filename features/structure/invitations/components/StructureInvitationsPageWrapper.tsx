'use client';

import { useSession } from 'next-auth/react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeleteStructureInvitation } from '@/features/structure-invitations/hooks/useDeleteStructureInvitation';
import { useFindStructureInvitationsWithProfessional } from '@/features/structure-invitations/hooks/useFindStructureInvitationsWithProfessional';
import { StructureInvitationConfig } from '@/features/structure-invitations/structureInvitation.config';
import {
  InvitationStatus,
  InvitationStatusLabel,
} from '@/features/structure-invitations/structureInvitation.model';

import { StructureInvitationsTable } from './StructureInvitationsTable';

interface StructureInvitationsPageWrapperProps {
  locale: string;
  translations: {
    actions: string;
    allProfessionals: string;
    allStatuses: string;
    cancel: string;
    cancelError: string;
    cancelSuccess: string;
    createdAt: string;
    delete: string;
    deleteError: string;
    deleteSuccess: string;
    filterByProfessional: string;
    filterByStatus: string;
    loading: string;
    name: string;
    noActions: string;
    noResults: string;
    status: string;
    subtitle: string;
    title: string;
    unknownProfessional: string;
  };
}

export function StructureInvitationsPageWrapper({
  locale,
  translations,
}: StructureInvitationsPageWrapperProps) {
  const { data: session } = useSession();
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(StructureInvitationConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(StructureInvitationConfig.PAGE_SIZE_DEFAULT)
  );
  const [professionalId, setProfessionalId] = useQueryState(
    'professional',
    parseAsString.withDefault('all')
  );
  const [status, setStatus] = useQueryState(
    'status',
    parseAsString.withDefault('all')
  );

  const deleteInvitation = useDeleteStructureInvitation();

  // Fetch all invitations to get unique professionals (for filter dropdown)
  const { data: allInvitationsData } =
    useFindStructureInvitationsWithProfessional(
      {
        structure_id: session?.user?.id,
      },
      { limit: 1000, page: 1 }
    );

  // Extract unique professionals from all invitations
  const uniqueProfessionals = useMemo(() => {
    const invitations = allInvitationsData?.data ?? [];
    const professionalMap = new Map<
      string,
      { id: string; name: null | string }
    >();

    invitations.forEach(invitation => {
      if (invitation.professional) {
        const profId = invitation.professional.user_id;
        if (!professionalMap.has(profId)) {
          const profile = invitation.professional.profile;
          const firstName = profile?.first_name || '';
          const lastName = profile?.last_name || '';
          const name =
            `${firstName} ${lastName}`.trim() ||
            profile?.email ||
            translations.unknownProfessional ||
            'Unknown';
          professionalMap.set(profId, {
            id: profId,
            name,
          });
        }
      }
    });

    return Array.from(professionalMap.values()).sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [allInvitationsData, translations.unknownProfessional]);

  // Build filters object
  const filters = useMemo(() => {
    const filterObj: {
      professional_id?: string;
      status?:
        | typeof InvitationStatus.accepted
        | typeof InvitationStatus.declined
        | typeof InvitationStatus.pending;
      structure_id?: string;
    } = {
      structure_id: session?.user?.id,
    };

    if (professionalId && professionalId !== 'all') {
      filterObj.professional_id = professionalId;
    }

    if (status && status !== 'all') {
      filterObj.status = status as
        | typeof InvitationStatus.accepted
        | typeof InvitationStatus.declined
        | typeof InvitationStatus.pending;
    }

    return filterObj;
  }, [session?.user?.id, professionalId, status]);

  const { data, isLoading } = useFindStructureInvitationsWithProfessional(
    filters,
    { limit: pageSize, page }
  );

  const invitations = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleProfessionalChange = (value: string) => {
    setProfessionalId(value);
    setPage(StructureInvitationConfig.PAGE_DEFAULT);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(StructureInvitationConfig.PAGE_DEFAULT);
  };

  const handleCancel = async (invitation: {
    id: string;
    professional: { profile: { email: null | string } | null } | null;
  }) => {
    try {
      await deleteInvitation.mutateAsync(invitation.id);
      toast.success(translations.cancelSuccess);
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast.error(translations.cancelError);
    }
  };

  const handleDelete = async (invitation: {
    id: string;
    professional: { profile: { email: null | string } | null } | null;
  }) => {
    try {
      await deleteInvitation.mutateAsync(invitation.id);
      toast.success(translations.deleteSuccess);
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast.error(translations.deleteError);
    }
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div>{translations.loading || 'Chargement...'}</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen space-y-4 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          {translations.title}
        </h1>
        <p className='mt-2 text-sm text-gray-600 sm:text-base'>
          {translations.subtitle}
        </p>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-3 sm:flex-row sm:gap-4'>
        <Select onValueChange={handleProfessionalChange} value={professionalId}>
          <SelectTrigger className='w-full sm:w-[250px]'>
            <SelectValue placeholder={translations.filterByProfessional} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{translations.allProfessionals}</SelectItem>
            {uniqueProfessionals.map(professional => {
              const professionalName =
                professional.name || translations.unknownProfessional;
              return (
                <SelectItem key={professional.id} value={professional.id}>
                  {professionalName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select onValueChange={handleStatusChange} value={status}>
          <SelectTrigger className='w-full sm:w-[250px]'>
            <SelectValue placeholder={translations.filterByStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{translations.allStatuses}</SelectItem>
            <SelectItem value={InvitationStatus.pending}>
              {InvitationStatusLabel[locale as 'en' | 'fr'].pending}
            </SelectItem>
            <SelectItem value={InvitationStatus.accepted}>
              {InvitationStatusLabel[locale as 'en' | 'fr'].accepted}
            </SelectItem>
            <SelectItem value={InvitationStatus.declined}>
              {InvitationStatusLabel[locale as 'en' | 'fr'].declined}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className='min-w-0 overflow-x-auto'>
        <StructureInvitationsTable
          currentPage={page}
          data={invitations}
          locale={locale}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          translations={translations}
        />
      </div>
    </div>
  );
}
