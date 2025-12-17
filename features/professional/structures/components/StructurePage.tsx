'use client';

import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, useQueryState } from 'nuqs';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/features/paginations/components/Pagination';
import { StructureCard } from '@/features/professional/structures/components/StructureCard';
import { useStructuresForProfessional } from '@/features/structure-members/hooks/useStructuresForProfessional';
import { StructureMemberConfig } from '@/features/structure-members/structureMember.config';

export default function StructuresPage() {
  const tAdmin = useTranslations('admin');
  const { data: session } = useSession();
  const professionalId = session?.user?.id ?? '';

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(StructureMemberConfig.PAGE_DEFAULT)
  );
  const [pageSize, setPageSize] = useQueryState(
    'limit',
    parseAsInteger.withDefault(StructureMemberConfig.PAGE_SIZE_DEFAULT)
  );

  const { data: structureMembersData } = useStructuresForProfessional(
    professionalId,
    {},
    { limit: pageSize, page }
  );

  const structureMembers = structureMembersData?.data ?? [];
  const totalCount = structureMembersData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleAddStructure = () => {
    console.log('Add structure');
  };

  return (
    <div className='min-h-screen space-y-6 bg-blue-50/30 p-8'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>
            {tAdmin('structure.title')}
          </h1>
          <p className='mt-2 text-gray-600'>
            {tAdmin('structure.description')}
          </p>
        </div>
        <Button
          className='rounded-lg bg-blue-400 text-white hover:bg-blue-500'
          onClick={handleAddStructure}
        >
          <Plus className='mr-2 h-4 w-4' />
          {tAdmin('structure.addStructure')}
        </Button>
      </div>

      {/* Structures Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {structureMembers.map(structureMember => (
          <StructureCard
            key={structureMember.id}
            structureMember={structureMember}
          />
        ))}
      </div>

      {structureMembers.length === 0 && (
        <div className='py-12 text-center text-gray-500'>
          <p>{tAdmin('structure.noStructures')}</p>
          <Button
            className='mt-4 bg-blue-500 text-white hover:bg-blue-600'
            onClick={handleAddStructure}
          >
            <Plus className='mr-2 h-4 w-4' />
            {tAdmin('structure.addStructure')}
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div className='mt-8'>
          <Pagination
            currentPage={page}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSize={pageSize}
            totalItems={totalCount}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
}
