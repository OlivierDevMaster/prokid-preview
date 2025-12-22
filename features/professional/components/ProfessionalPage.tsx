'use client';

import { MapPin, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfessionalCard } from '@/features/professional/components/ProfessionalCard';

import { MOCK_PROFESSIONALS } from '../fixtures/professional.fixtures';

export default function ProfessionalPage() {
  const t = useTranslations('professional');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] =
    useState<string>('all');

  const filteredProfessionals = MOCK_PROFESSIONALS.filter(prof => {
    const matchesSearch =
      !searchQuery ||
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.skills.some(skill =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLocation =
      !locationQuery ||
      prof.location.toLowerCase().includes(locationQuery.toLowerCase());

    const matchesRole = selectedRole === 'all' || prof.role === selectedRole;

    const matchesAvailability = selectedAvailability === 'all' || true;

    return (
      matchesSearch && matchesLocation && matchesRole && matchesAvailability
    );
  });

  const resultsCount = filteredProfessionals.length;

  return (
    <div className='min-h-screen bg-[#f5f7f5] px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-8'>
          <h1 className='mb-2 text-4xl font-bold text-gray-800'>
            {t('title')}
          </h1>
          <p className='text-lg text-gray-600'>{t('subtitle')}</p>
        </div>

        <div className='mb-6 rounded-lg bg-gray-100 p-6'>
          <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <Input
                className='pl-10'
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                value={searchQuery}
              />
            </div>

            <div className='relative'>
              <MapPin className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <Input
                className='pl-10'
                onChange={e => setLocationQuery(e.target.value)}
                placeholder={t('search.locationPlaceholder')}
                value={locationQuery}
              />
            </div>

            <Select onValueChange={setSelectedRole} value={selectedRole}>
              <SelectTrigger>
                <SelectValue placeholder={t('search.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('roles.all')}</SelectItem>
                <SelectItem value='RSAI'>{t('roles.rsai')}</SelectItem>
                <SelectItem value='Référente Technique'>
                  {t('roles.technicalReferent')}
                </SelectItem>
                <SelectItem value='EJE'>{t('roles.eje')}</SelectItem>
                <SelectItem value='Psychomotricien'>
                  {t('roles.psychomotor')}
                </SelectItem>
                <SelectItem value='AP'>{t('roles.ap')}</SelectItem>
                <SelectItem value='Diététicien'>
                  {t('roles.dietitian')}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={setSelectedAvailability}
              value={selectedAvailability}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('search.availability')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('availability.all')}</SelectItem>
                <SelectItem value='morning'>
                  {t('availability.morning')}
                </SelectItem>
                <SelectItem value='afternoon'>
                  {t('availability.afternoon')}
                </SelectItem>
                <SelectItem value='fullDay'>
                  {t('availability.fullDay')}
                </SelectItem>
                <SelectItem value='weekend'>
                  {t('availability.weekend')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery ||
            locationQuery ||
            selectedRole !== 'all' ||
            selectedAvailability !== 'all') && (
            <div className='text-sm text-gray-600'>
              {t('search.activeFilters')}
            </div>
          )}
        </div>

        <div className='mb-6'>
          <p className='text-gray-700'>
            <span className='font-semibold'>{resultsCount}</span>{' '}
            {resultsCount === 1 ? t('results.foundOne') : t('results.found')}
          </p>
        </div>

        <div className='space-y-4'>
          {filteredProfessionals.map(professional => (
            <ProfessionalCard
              availability={professional.availability}
              description={professional.description}
              distance={professional.distance}
              hourlyRate={professional.hourlyRate}
              id={professional.id}
              key={professional.id}
              location={professional.location}
              name={professional.name}
              role={professional.role}
              skills={professional.skills}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
