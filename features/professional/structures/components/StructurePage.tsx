'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { StructureCard } from '@/features/professional/structures/components/StructureCard';

import useGetStructures from '../hooks/useGetStructures';

export default function StructuresPage() {
  const tAdmin = useTranslations('admin');
  const { data: structures } = useGetStructures();

  const handleAddStructure = () => {
    console.log('Add structure');
  };

  const handleViewDetails = (id: string) => {
    console.log('View details for structure:', id);
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
        {(structures ?? []).map(structure => (
          <StructureCard key={structure.user_id} structure={structure} />
        ))}
      </div>

      {(structures ?? []).length === 0 && (
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
    </div>
  );
}
