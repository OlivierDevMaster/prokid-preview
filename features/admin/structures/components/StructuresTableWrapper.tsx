'use client';

import { useState } from 'react';

import type { Structure } from '@/features/structures/structure.model';

import { useFindStructures } from '@/features/structures/hooks/useFindStructures';

import { DeleteStructureDialog } from './DeleteStructureDialog';
import { EditStructureDialog } from './EditStructureDialog';
import { StructuresTable } from './StructuresTable';

interface StructuresTableWrapperProps {
  locale: string;
  translations: {
    actions?: string;
    createdAt: string;
    delete?: string;
    edit?: string;
    email: string;
    name: string;
    next: string;
    noResults?: string;
    of: string;
    page: string;
    previous: string;
    view?: string;
  };
}

export function StructuresTableWrapper({
  locale,
  translations,
}: StructuresTableWrapperProps) {
  const { data, isLoading } = useFindStructures({}, { limit: 1000 });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<null | Structure>(
    null
  );

  const structures = data?.data ?? [];

  const handleEdit = (structure: Structure) => {
    setSelectedStructure(structure);
    setEditDialogOpen(true);
  };

  const handleDelete = (structure: Structure) => {
    setSelectedStructure(structure);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <p className='py-8 text-center text-gray-500'>Loading...</p>;
  }

  if (structures.length === 0) {
    return (
      <p className='py-8 text-center text-gray-500'>{translations.noResults}</p>
    );
  }

  return (
    <>
      <StructuresTable
        data={structures}
        locale={locale}
        translations={{
          ...translations,
          onDelete: handleDelete,
          onEdit: handleEdit,
        }}
      />
      <EditStructureDialog
        onOpenChange={setEditDialogOpen}
        open={editDialogOpen}
        structure={selectedStructure}
      />
      <DeleteStructureDialog
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        structure={selectedStructure}
      />
    </>
  );
}
