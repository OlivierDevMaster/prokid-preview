'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import {
  type Structure,
  StructureCard,
} from '@/components/admin/structure/StructureCard';
import { Button } from '@/components/ui/button';

const mockStructures: Structure[] = [
  {
    email: 'contact@petitsloups.fr',
    hoursCompleted: 32,
    hoursTotal: 80,
    id: '1',
    lastReportDate: '15/12/2024',
    location: 'Paris 15ème',
    name: 'Micro-crèche Les Petits Loups',
    status: 'on_time',
  },
  {
    email: 'direction@arcenciel.fr',
    hoursCompleted: 18,
    hoursTotal: 50,
    id: '2',
    lastReportDate: '10/12/2024',
    location: 'Lyon 6ème',
    name: 'Crèche Familiale Arc-en-Ciel',
    status: 'to_monitor',
  },
];

export default function StructuresPage() {
  const [structures] = useState<Structure[]>(mockStructures);

  const handleAddStructure = () => {
    console.log('Add structure');
  };

  const handleViewDetails = (id: string) => {
    console.log('View details for structure:', id);
  };

  return (
    <div className='-m-8 min-h-screen space-y-6 bg-blue-50/30 p-8'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Mes structures</h1>
          <p className='mt-2 text-gray-600'>
            Gérez vos interventions et suivis pour chaque établissement
          </p>
        </div>
        <Button
          className='rounded-lg bg-blue-400 text-white hover:bg-blue-500'
          onClick={handleAddStructure}
        >
          <Plus className='mr-2 h-4 w-4' />
          Ajouter une structure
        </Button>
      </div>

      {/* Structures Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {structures.map(structure => (
          <StructureCard
            key={structure.id}
            onViewDetails={handleViewDetails}
            structure={structure}
          />
        ))}
      </div>

      {structures.length === 0 && (
        <div className='py-12 text-center text-gray-500'>
          <p>Aucune structure pour le moment.</p>
          <Button
            className='mt-4 bg-blue-500 text-white hover:bg-blue-600'
            onClick={handleAddStructure}
          >
            <Plus className='mr-2 h-4 w-4' />
            Ajouter une structure
          </Button>
        </div>
      )}
    </div>
  );
}
