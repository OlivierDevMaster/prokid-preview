'use client';

import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Pencil,
  TrendingUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AvailabilitiesPage() {
  const t = useTranslations('admin.planning');
  // Initialiser avec une date fixe pour éviter les problèmes d'hydratation
  // Utiliser useState avec une fonction pour garantir la même valeur entre serveur et client
  const [currentWeek, setCurrentWeek] = useState(() => new Date(2025, 10, 24)); // 24 novembre 2025
  const [mounted, setMounted] = useState(false);

  // S'assurer que le composant est monté côté client avant d'utiliser des valeurs dynamiques
  useEffect(() => {
    setMounted(true);
  }, []);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const dayNames = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];

  // Mock data - À remplacer par des données réelles
  const stats = {
    availableSlots: 0,
    bookedHours: 0,
    estimatedRevenue: 0,
    fillRate: 0,
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-blue-900'>{t('title')}</h1>
        <Button
          className='border-blue-500 text-blue-700 hover:bg-blue-50'
          variant='outline'
        >
          <Pencil className='mr-2 h-4 w-4' />
          {t('modifyAvailabilities')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Taux de remplissage */}
        <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='p-6'>
            <h3 className='mb-2 text-sm font-medium text-gray-600'>
              {t('fillRate')}
            </h3>
            <div className='mb-3 text-3xl font-bold text-blue-900'>
              {stats.fillRate}%
            </div>
            <div className='h-2 w-full rounded-full bg-green-100'>
              <div
                className='h-2 rounded-full bg-green-500 transition-all'
                style={{ width: `${stats.fillRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Heures réservées */}
        <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='p-6'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-600'>
                {t('bookedHours')}
              </h3>
              <Clock className='h-5 w-5 text-gray-400' />
            </div>
            <div className='mb-1 text-3xl font-bold text-blue-900'>
              {stats.bookedHours}h
            </div>
            <p className='text-sm text-gray-500'>{t('thisWeek')}</p>
          </div>
        </Card>

        {/* Créneaux disponibles */}
        <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='p-6'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-600'>
                {t('availableSlots')}
              </h3>
              <TrendingUp className='h-5 w-5 text-green-500' />
            </div>
            <div className='mb-1 text-3xl font-bold text-green-600'>
              {stats.availableSlots}
            </div>
            <p className='text-sm text-gray-500'>{t('toBook')}</p>
          </div>
        </Card>

        {/* Revenus estimés */}
        <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='p-6'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-600'>
                {t('estimatedRevenue')}
              </h3>
              <DollarSign className='h-5 w-5 text-gray-400' />
            </div>
            <div className='mb-1 text-3xl font-bold text-blue-900'>
              {stats.estimatedRevenue}€
            </div>
            <p className='text-sm text-gray-500'>{t('thisWeek')}</p>
          </div>
        </Card>
      </div>

      {/* Weekly Navigation */}
      <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
        <Button
          className='text-gray-600 hover:text-gray-800'
          onClick={goToPreviousWeek}
          size='sm'
          variant='ghost'
        >
          <ChevronLeft className='mr-1 h-4 w-4' />
          {t('previousWeek')}
        </Button>
        <h2 className='text-lg font-bold text-blue-900'>
          {t('weekOf')} {format(weekStart, 'd MMMM yyyy', { locale: fr })}
        </h2>
        <Button
          className='text-gray-600 hover:text-gray-800'
          onClick={goToNextWeek}
          size='sm'
          variant='ghost'
        >
          {t('nextWeek')}
          <ChevronRight className='ml-1 h-4 w-4' />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className='grid grid-cols-7 gap-3'>
        {weekDays.map((day, index) => {
          // Utiliser mounted pour éviter les différences d'hydratation
          const isToday = mounted && isSameDay(day, new Date());
          const dayName = dayNames[index];
          const dayNumber = format(day, 'd');
          const month = format(day, 'MMM', { locale: fr });

          return (
            <Card
              className={`min-h-[200px] rounded-lg border-2 bg-white shadow-sm ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              key={index}
            >
              <div className='p-4'>
                <div className='mb-1 text-sm font-bold text-blue-900'>
                  {dayName}
                </div>
                <div className='mb-4 text-sm text-blue-900'>
                  {dayNumber} {month}
                </div>
                {/* Ici on peut ajouter les créneaux/réservations */}
                <div className='space-y-2'>
                  {/* Les créneaux seront ajoutés ici */}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
