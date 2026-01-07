'use client';

import { useSession } from 'next-auth/react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { toast } from 'sonner';

import { useAcceptStructureInvitation } from '@/features/structure-invitations/hooks/useAcceptStructureInvitation';
import { useDeclineStructureInvitation } from '@/features/structure-invitations/hooks/useDeclineStructureInvitation';
import { useFindStructureInvitationsWithStructure } from '@/features/structure-invitations/hooks/useFindStructureInvitationsWithStructure';
import { StructureInvitationConfig } from '@/features/structure-invitations/structureInvitation.config';

import { InvitationsTable } from './InvitationsTable';

interface InvitationsPageWrapperProps {
  locale: string;
  translations: {
    accept: string;
    acceptError: string;
    acceptSuccess: string;
    actions: string;
    createdAt: string;
    decline: string;
    declineError: string;
    declineSuccess: string;
    description: string;
    name: string;
    noActions: string;
    noResults: string;
    status: string;
    subtitle: string;
    title: string;
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

  const acceptInvitation = useAcceptStructureInvitation();
  const declineInvitation = useDeclineStructureInvitation();

  const { data, isLoading } = useFindStructureInvitationsWithStructure(
    {
      professional_id: session?.user?.id,
    },
    { limit: pageSize, page }
  );

  const invitations = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

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
    <div className='min-h-full space-y-4 bg-blue-50/30 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          {translations.title}
        </h1>
        <p className='mt-2 text-sm text-gray-600 sm:text-base'>
          {translations.subtitle}
        </p>
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
