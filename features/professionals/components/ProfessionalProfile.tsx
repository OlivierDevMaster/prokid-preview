'use client';

import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Euro,
  Heart,
  MapPin,
  Plus,
  Send,
  Star,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AvailabilityCalendar } from '@/features/professional/components/AvailabilityCalendar';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { useCheckStructureMembership } from '@/features/structure-members/hooks/useCheckStructureMembership';
import { useGetMembershipId } from '@/features/structure-members/hooks/useGetMembershipId';
import { useCreateInvitation } from '@/features/structure/invitations/hooks/useCreateInvitation';
import { RatingModal } from '@/features/structure/ratings/components/RatingModal';
import { useCreateRating } from '@/features/structure/ratings/hooks/useCreateRating';
import { useRatingForMembership } from '@/features/structure/ratings/hooks/useRatingForMembership';
import { useRole } from '@/hooks/useRole';
import { Link, useRouter } from '@/i18n/routing';

export default function ProfessionalProfile() {
  const { id } = useParams();
  const t = useTranslations('professional.profile');
  const tProfessional = useTranslations('professional');
  const tRating = useTranslations('structure.ratings');
  const tInvitation = useTranslations('structure.invitations');
  const tMission = useTranslations('structure.missions');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { data: session } = useSession();
  const { isStructure, userId } = useRole();
  const professionalId = id as string;

  const { data: professional, isLoading: isProfessionalLoading } =
    useFindProfessional(professionalId);
  const { data: hasMembership, isLoading: isLoadingMembership } =
    useCheckStructureMembership(userId, professionalId);
  const { data: membershipId } = useGetMembershipId(userId, professionalId);
  const { data: existingRating } = useRatingForMembership(
    membershipId ?? undefined
  );
  const createInvitation = useCreateInvitation();
  const createRating = useCreateRating();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const handleSendInvitation = async () => {
    if (!userId || !professionalId) {
      toast.error(tInvitation('errors.failedToSend'));
      return;
    }

    try {
      await createInvitation.mutateAsync({
        professional_id: professionalId,
        status: 'pending',
      });
      toast.success(tInvitation('success.invitationSent'));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : tInvitation('errors.failedToSend')
      );
    }
  };

  const handleCreateMission = () => {
    router.push(`/structure/missions/new?professional_id=${professionalId}`);
  };

  const handleOpenRatingModal = () => {
    setIsRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false);
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!userId || !professionalId || !membershipId) {
      toast.error(tRating('ratingError'));
      return;
    }

    try {
      await createRating.mutateAsync({
        comment: comment || null,
        membershipId,
        professionalId,
        rating,
        structureId: userId,
      });
      toast.success(tRating('ratingSuccess'));
      setIsRatingModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : tRating('ratingError')
      );
    }
  };

  const canRate =
    session && isStructure && hasMembership && membershipId && !existingRating;

  const getJobTranslation = (job: null | string | undefined): string => {
    if (!job) {
      return job || '';
    }
    try {
      const translationKey = `jobs.${job}`;
      const translated = tProfessional(translationKey);
      // If translation doesn't exist, next-intl returns the full key path
      // Check if it's the same as what we'd expect for a missing key
      if (
        translated === translationKey ||
        translated === `professional.${translationKey}`
      ) {
        return job;
      }
      return translated;
    } catch {
      return job;
    }
  };

  if (isProfessionalLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <p className='text-gray-500'>{tCommon('messages.loading')}</p>
      </div>
    );
  }

  if (!professional) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-white'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {t('notFound')}
          </h1>
          <Link href='/professional'>
            <Button>{t('backToList')}</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8'>
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
                      {professional.profile.avatar_url ? (
                        <Image
                          alt={professional.profile.first_name ?? ''}
                          className='h-full w-full object-cover'
                          height={96}
                          src={professional.profile.avatar_url}
                          unoptimized
                          width={96}
                        />
                      ) : (
                        <span className='text-4xl font-semibold text-gray-500'>
                          {professional.profile.first_name?.charAt(0) ?? ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex-1 justify-center'>
                    <h1 className='mb-2 text-center text-2xl font-bold text-gray-800'>
                      {professional.profile.first_name}
                      <span className='pl-2'>
                        {professional.profile.last_name}
                      </span>
                    </h1>
                    <p className='mb-3 text-center text-lg text-sm text-blue-500'>
                      {getJobTranslation(professional.current_job)}
                    </p>

                    {/* Badges */}
                    <div className='mb-4 flex flex-wrap justify-center gap-2'>
                      {professional.is_certified && (
                        <Badge className='bg-green-100 text-green-700 hover:bg-green-200'>
                          <CheckCircle2 className='mr-1 h-3 w-3' />
                          {t('verified')}
                        </Badge>
                      )}
                      {professional.is_available && (
                        <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-200'>
                          {t('available')}
                        </Badge>
                      )}
                    </div>

                    <div className='flex items-center justify-center gap-2 text-sm text-gray-600'>
                      <Star className='h-4 w-4 fill-yellow-500 text-yellow-500' />
                      <span className='font-semibold text-yellow-500'>
                        {professional.rating
                          ? Number(professional.rating).toFixed(1)
                          : '0.0'}
                      </span>
                      <span className='text-gray-500'>
                        ({professional.reviews_count || 0} {t('reviews')})
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
                    {professional.skills?.map((skill, index) => (
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
                      {professional.city} • {t('sector')}{' '}
                      {professional.intervention_radius_km} {t('km')}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <CalendarIcon className='h-4 w-4 text-gray-400' />
                    <span>
                      {professional.experience_years} {t('experience')}
                      {professional.is_certified && (
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
                      {professional.hourly_rate}€/{t('day')}
                    </span>
                  </div>
                </div>

                <div className='my-4 w-full border'></div>
                {/* Boutons d'action */}
                {session && isStructure && !isLoadingMembership && (
                  <div className='mb-4 flex flex-col gap-3'>
                    {hasMembership ? (
                      <>
                        <Button
                          className='flex-1 bg-blue-500 text-white hover:bg-blue-600'
                          onClick={handleCreateMission}
                        >
                          <Plus className='mr-2 h-4 w-4' />
                          {tMission('createMission')}
                        </Button>
                        {canRate && (
                          <Button
                            className='flex-1'
                            onClick={handleOpenRatingModal}
                            variant='outline'
                          >
                            <Heart className='mr-2 h-4 w-4' />
                            {tRating('rateProfessional')}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        className='flex-1 bg-blue-500 text-white hover:bg-blue-600'
                        disabled={createInvitation.isPending}
                        onClick={handleSendInvitation}
                      >
                        <Send className='mr-2 h-4 w-4' />
                        {createInvitation.isPending
                          ? tInvitation('sending')
                          : tInvitation('sendInvitation')}
                      </Button>
                    )}
                  </div>
                )}

                <RatingModal
                  isOpen={isRatingModalOpen}
                  isSubmitting={createRating.isPending}
                  onClose={handleCloseRatingModal}
                  onSubmit={handleSubmitRating}
                />
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
            <AvailabilityCalendar professionalId={id as string} />
          </div>
        </div>
      </div>
    </main>
  );
}
