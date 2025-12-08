'use client';

import { useState } from 'react';

import type { Professional } from '@/features/professionals/professional.model';

import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';

import { DeleteProfessionalDialog } from './DeleteProfessionalDialog';
import { EditProfessionalDialog } from './EditProfessionalDialog';
import { ProfessionalsTable } from './ProfessionalsTable';

interface ProfessionalsTableWrapperProps {
  locale: string;
  translations: {
    actions?: string;
    city: string;
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
    skills: string;
    view?: string;
  };
}

export function ProfessionalsTableWrapper({
  locale,
  translations,
}: ProfessionalsTableWrapperProps) {
  const { data, isLoading } = useFindProfessionals({}, { limit: 1000 });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] =
    useState<null | Professional>(null);

  const professionals = data?.data ?? [];

  const handleEdit = (professional: Professional) => {
    setSelectedProfessional(professional);
    setEditDialogOpen(true);
  };

  const handleDelete = (professional: Professional) => {
    setSelectedProfessional(professional);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <p className='py-8 text-center text-gray-500'>Loading...</p>;
  }

  if (professionals.length === 0) {
    return (
      <p className='py-8 text-center text-gray-500'>{translations.noResults}</p>
    );
  }

  return (
    <>
      <ProfessionalsTable
        data={professionals}
        locale={locale}
        translations={{
          ...translations,
          onDelete: handleDelete,
          onEdit: handleEdit,
        }}
      />
      <EditProfessionalDialog
        onOpenChange={setEditDialogOpen}
        open={editDialogOpen}
        professional={selectedProfessional}
      />
      <DeleteProfessionalDialog
        onOpenChange={setDeleteDialogOpen}
        open={deleteDialogOpen}
        professional={selectedProfessional}
      />
    </>
  );
}
