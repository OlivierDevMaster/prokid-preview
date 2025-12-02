'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PersonalInfoForm() {
  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-bold text-blue-900'>
        Informations personnelles
      </h2>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='firstName'
          >
            Prénom *
          </Label>
          <Input
            className='w-full'
            defaultValue='Marie'
            id='firstName'
            type='text'
          />
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='lastName'
          >
            Nom *
          </Label>
          <Input
            className='w-full'
            defaultValue='Joux'
            id='lastName'
            type='text'
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700' htmlFor='email'>
            Adresse e-mail *
          </Label>
          <Input
            className='w-full'
            defaultValue='marie.joux@prokid.fr'
            id='email'
            type='email'
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700' htmlFor='phone'>
            Numéro de téléphone
          </Label>
          <Input
            className='w-full'
            defaultValue='06 12 34 56 78'
            id='phone'
            type='tel'
          />
        </div>
      </div>
    </div>
  );
}
