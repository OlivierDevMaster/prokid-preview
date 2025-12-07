import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Euro,
  Heart,
  Mail,
  MapPin,
  Star,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AvailabilityCalendar } from '@/features/professional/components/AvailabilityCalendar';
import { Link } from '@/i18n/routing';

// Mock data - À remplacer par un appel API/service
const MOCK_PROFESSIONALS = [
  {
    availability: 'Lundi-Vendredi matin',
    dailyRate: 250,
    description:
      "Éducatrice de jeunes enfants passionnée avec 8 ans d'expérience. Spécialisée dans l'accompagnement des enfants en situation de handicap et dans les méthodes Montessori. J'aime créer des activités ludiques qui favorisent l'autonomie et l'épanouissement de chaque enfant.",
    distance: 15,
    email: 'marie.dubois@example.com',
    experience: '8 ans',
    hourlyRate: 35,
    id: '1',
    imageUrl: '/placeholder-avatar.jpg',
    isAvailable: true,
    isCertified: true,
    isVerified: true,
    location: 'Brest, Finistère',
    name: 'Marie Dubois',
    phone: '+33 6 12 34 56 78',
    rating: 4.8,
    reviewsCount: 12,
    role: 'Éducateur de jeunes enfants',
    skills: [
      'Montessori',
      'Troubles neurodéveloppementaux',
      'Créativité',
      'Développement social',
    ],
  },
  {
    availability: 'Lundi-Vendredi matin',
    dailyRate: 300,
    description:
      "Spécialisée dans l'accompagnement des enfants en situation de handicap, je propose un suivi personnalisé et adapté à chaque besoin.",
    distance: 20,
    email: 'claire.legoff@example.com',
    experience: '10 ans',
    hourlyRate: 45,
    id: '2',
    isAvailable: true,
    isCertified: true,
    isVerified: true,
    location: 'Quimper',
    name: 'Claire Le Goff',
    phone: '+33 6 12 34 56 78',
    rating: 4.8,
    reviewsCount: 15,
    role: 'RSAI',
    skills: ['Santé', 'Inclusion', 'Handicap', 'Accompagnement', 'Formation'],
  },
];

interface ProfessionalProfilePageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default async function ProfessionalProfilePage({
  params,
}: ProfessionalProfilePageProps) {
  const { id } = await params;
  const t = await getTranslations('professional.profile');

  // Trouver le professionnel - À remplacer par un appel API/service
  const professional = MOCK_PROFESSIONALS.find(p => p.id === id);

  if (!professional) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {t('notFound')}
          </h1>
          <Link href='/professional'>
            <Button>{t('backToList')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {/* Colonne gauche - Profil du professionnel */}
          <div className='lg:col-span-1'>
            <Card className='rounded-lg border border-gray-200 bg-white shadow-sm'>
              <div className='p-8'>
                {/* Header du profil */}
                <div className='mb-8 flex flex-col items-center gap-6'>
                  <div className='flex-shrink-0'>
                    <div className='flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-300 bg-gray-200'>
                      {professional.imageUrl ? (
                        <Image
                          alt={professional.name}
                          className='h-full w-full object-cover'
                          height={96}
                          src={professional.imageUrl}
                          width={96}
                        />
                      ) : (
                        <span className='text-4xl font-semibold text-gray-500'>
                          {professional.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex-1'>
                    <h1 className='mb-2 text-center text-2xl font-bold text-gray-800'>
                      {professional.name}
                    </h1>
                    <p className='mb-3 text-lg text-gray-700'>
                      {professional.role}
                    </p>

                    {/* Badges */}
                    <div className='mb-4 flex flex-wrap gap-2'>
                      {professional.isVerified && (
                        <Badge className='bg-green-400/60 text-white hover:bg-green-400'>
                          <CheckCircle2 className='mr-1 h-3 w-3' />
                          {t('verified')}
                        </Badge>
                      )}
                      {professional.isAvailable && (
                        <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-200'>
                          {t('available')}
                        </Badge>
                      )}
                    </div>

                    {/* Note */}
                    <div className='mb-4 flex items-center gap-1'>
                      <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                      <span className='text-lg font-semibold text-gray-800'>
                        {professional.rating}
                      </span>
                      <span className='text-sm text-gray-500'>
                        ({professional.reviewsCount} {t('reviews')})
                      </span>
                    </div>
                  </div>
                </div>

                <div className='my-4 w-full border'></div>
                {/* Spécialités */}
                <div className='mb-6'>
                  <h2 className='mb-3 text-sm font-semibold text-gray-700'>
                    {t('specialties')}
                  </h2>
                  <div className='flex flex-wrap gap-2'>
                    {professional.skills.map((skill, index) => (
                      <Badge
                        className='border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        key={index}
                        variant='outline'
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className='my-4 w-full border'></div>

                {/* Localisation et expérience */}
                <div className='mb-6 space-y-3'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <MapPin className='h-4 w-4 text-gray-400' />
                    <span>
                      {professional.location} • {t('sector')}{' '}
                      {professional.distance} {t('km')}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <CalendarIcon className='h-4 w-4 text-gray-400' />
                    <span>
                      {professional.experience} {t('experience')}
                      {professional.isCertified && (
                        <span className='ml-2'>
                          • {t('certifiedProfessional')}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Tarifs */}
                <div className='mb-6 flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <Euro className='h-5 w-5 text-gray-600' />
                    <span className='text-lg font-semibold text-gray-800'>
                      {professional.hourlyRate}€/{t('hour')}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Euro className='h-5 w-5 text-gray-600' />
                    <span className='text-lg font-semibold text-gray-800'>
                      {professional.dailyRate}€/{t('day')}
                    </span>
                  </div>
                </div>

                <div className='my-4 w-full border'></div>

                {/* Boutons d'action */}
                <div className='mb-8 flex flex-col gap-3'>
                  <Button className='flex-1 bg-blue-500 text-white hover:bg-blue-600'>
                    <Mail className='mr-2 h-4 w-4' />
                    {t('sendMessage')}
                  </Button>
                  <Button
                    className='border-gray-300 text-gray-700 hover:bg-gray-50'
                    variant='outline'
                  >
                    <Heart className='h-4 w-4' />
                    {t('addFavorite')}
                  </Button>
                </div>

                {/* Section À propos */}
                <div className='border-t pt-6'>
                  <h2 className='mb-3 text-lg font-bold text-gray-800'>
                    {t('about')}
                  </h2>
                  <p className='leading-relaxed text-gray-600'>
                    {professional.description}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Colonne droite - Calendrier de disponibilités */}
          <div className='lg:col-span-2'>
            <AvailabilityCalendar professionalId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
