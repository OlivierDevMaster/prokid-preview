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
import { useAcceptStructureInvitation } from '@/features/structure-invitations/hooks/useAcceptStructureInvitation';
import { useDeclineStructureInvitation } from '@/features/structure-invitations/hooks/useDeclineStructureInvitation';
import { useFindStructureInvitationsWithStructure } from '@/features/structure-invitations/hooks/useFindStructureInvitationsWithStructure';
import { StructureInvitationConfig } from '@/features/structure-invitations/structureInvitation.config';
import {
  InvitationStatus,
  InvitationStatusLabel,
} from '@/features/structure-invitations/structureInvitation.model';

import { InvitationsTable } from './InvitationsTable';

interface InvitationsPageWrapperProps {
  locale: string;
  translations: {
    accept: string;
    acceptError: string;
    acceptSuccess: string;
    actions: string;
    allStatuses: string;
    allStructures: string;
    createdAt: string;
    decline: string;
    declineError: string;
    declineSuccess: string;
    description: string;
    filterByStatus: string;
    filterByStructure: string;
    name: string;
    noActions: string;
    noResults: string;
    status: string;
    subtitle: string;
    title: string;
    unknownStructure: string;
  };
}

export function InvitationsPageWrapper({
  locale,
  translations,
}: InvitationsPageWrapperProps) {
  const { data: session } = useSession();
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(StructureInvitationConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(StructureInvitationConfig.PAGE_SIZE_DEFAULT)
  );
  const [structureId, setStructureId] = useQueryState(
    'structure',
    parseAsString.withDefault('all')
  );
  const [status, setStatus] = useQueryState(
    'status',
    parseAsString.withDefault('all')
  );

  const acceptInvitation = useAcceptStructureInvitation();
  const declineInvitation = useDeclineStructureInvitation();

  // Fetch all invitations to get unique structures (for filter dropdown)
  const { data: allInvitationsData } = useFindStructureInvitationsWithStructure(
    {
      professional_id: session?.user?.id,
    },
    { limit: 1000, page: 1 }
  );

  // Extract unique structures from all invitations
  const uniqueStructures = useMemo(() => {
    const invitations = allInvitationsData?.data ?? [];
    const structureMap = new Map<string, { id: string; name: null | string }>();

    invitations.forEach(invitation => {
      if (invitation.structure) {
        const structureId = invitation.structure.user_id;
        if (!structureMap.has(structureId)) {
          structureMap.set(structureId, {
            id: structureId,
            name: invitation.structure.name,
          });
        }
      }
    });

    return Array.from(structureMap.values()).sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [allInvitationsData]);

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
      professional_id: session?.user?.id,
    };

    if (structureId && structureId !== 'all') {
      filterObj.structure_id = structureId;
    }

    if (status && status !== 'all') {
      filterObj.status = status as
        | typeof InvitationStatus.accepted
        | typeof InvitationStatus.declined
        | typeof InvitationStatus.pending;
    }

    return filterObj;
  }, [session?.user?.id, structureId, status]);

  const { data, isLoading } = useFindStructureInvitationsWithStructure(
    filters,
    { limit: pageSize, page }
  );

  const invitations = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleStructureChange = (value: string) => {
    setStructureId(value);
    setPage(StructureInvitationConfig.PAGE_DEFAULT);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(StructureInvitationConfig.PAGE_DEFAULT);
  };

  const handleAccept = async (invitation: {
    id: string;
    structure: { name: null | string } | null;
  }) => {
    try {
      await acceptInvitation.mutateAsync(invitation.id);
      toast.success(translations.acceptSuccess);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(translations.acceptError);
    }
  };

  const handleDecline = async (invitation: {
    id: string;
    structure: { name: null | string } | null;
  }) => {
    try {
      await declineInvitation.mutateAsync(invitation.id);
      toast.success(translations.declineSuccess);
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error(translations.declineError);
    }
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div>Loading...</div>
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
        <Select onValueChange={handleStructureChange} value={structureId}>
          <SelectTrigger className='w-full sm:w-[250px]'>
            <SelectValue
              placeholder={
                translations.filterByStructure || 'Filter by structure'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              {translations.allStructures || 'All structures'}
            </SelectItem>
            {uniqueStructures.map(structure => {
              const structureName =
                structure.name || translations.unknownStructure || 'Unknown';
              return (
                <SelectItem key={structure.id} value={structure.id}>
                  {structureName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select onValueChange={handleStatusChange} value={status}>
          <SelectTrigger className='w-full sm:w-[250px]'>
            <SelectValue
              placeholder={translations.filterByStatus || 'Filter by status'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              {translations.allStatuses || 'All statuses'}
            </SelectItem>
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
        <InvitationsTable
          currentPage={page}
          data={invitations}
          locale={locale}
          onAccept={handleAccept}
          onDecline={handleDecline}
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
