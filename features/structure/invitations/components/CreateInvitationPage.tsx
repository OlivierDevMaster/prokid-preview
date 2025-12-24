'use client';

import { ArrowLeft, Check, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFindProfessionals } from '@/features/professionals/hooks/useFindProfessionals';
import { Professional } from '@/features/professionals/professional.model';
import { useGetProfessionals } from '@/features/structure/professionals/hooks/useGetProfessionals';
import { useRouter } from '@/i18n/routing';

import { useCreateInvitation } from '../hooks/useCreateInvitation';

export function CreateInvitationPage() {
  const t = useTranslations('structure.invitations');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessional, setSelectedProfessional] =
    useState<null | Professional>(null);

  const { data: professionalsData } = useFindProfessionals(
    {
      search: searchQuery,
    },
    { limit: 20 }
  );

  const { data: structureProfessionalsData } = useGetProfessionals(
    {},
    { limit: 1000, page: 1 }
  );

  const structureProfessionalIds = useMemo(
    () => new Set(structureProfessionalsData?.data.map(prof => prof.id) ?? []),
    [structureProfessionalsData]
  );

  const professionals: Professional[] = useMemo(() => {
    const allProfessionals = professionalsData?.data ?? [];
    return allProfessionals.filter(
      professional => !structureProfessionalIds.has(professional.user_id)
    );
  }, [professionalsData, structureProfessionalIds]);

  const createInvitation = useCreateInvitation();

  const handleSelectProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
  };

  const handleSubmit = async () => {
    if (!selectedProfessional) {
      toast.error(t('errors.selectProfessional'));
      return;
    }

    try {
      await createInvitation.mutateAsync({
        professional_id: selectedProfessional.user_id,
        status: 'pending',
      });
      toast.success(t('success.invitationSent'));
      router.push('/structure/missions');
    } catch (error) {
      toast.error(t('errors.failedToSend'));
      console.error('Failed to create invitation:', error);
    }
  };

  const handleCancel = () => {
    router.push('/structure/missions');
  };

  return (
    <div className='min-h-screen space-y-6 bg-blue-50/30 p-8'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button className='rounded-lg' onClick={handleCancel} variant='outline'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          {t('back')}
        </Button>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>{t('title')}</h1>
          <p className='mt-2 text-gray-600'>{t('description')}</p>
        </div>
      </div>

      {/* Search Section */}
      <Card className='p-6'>
        <div className='mb-4'>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            {t('search.label')}
          </label>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input
              className='px-10'
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              value={searchQuery}
            />
            {searchQuery && (
              <Button
                className='absolute right-0 top-1/2 -translate-y-1/2'
                onClick={() => setSearchQuery('')}
                variant='ghost'
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>

        {/* Professionals List */}
        {professionals.length > 0 && (
          <div className='space-y-2'>
            <p className='text-sm font-medium text-gray-700'>
              {t('search.results', { count: professionals.length })}
            </p>
            <div className='max-h-96 space-y-2 overflow-y-auto'>
              {professionals.map(professional => {
                const isSelected =
                  selectedProfessional?.user_id === professional.user_id;
                const name =
                  `${professional.profile.first_name || ''} ${professional.profile.last_name || ''}`.trim() ||
                  professional.profile.email ||
                  'Unknown';

                return (
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    key={professional.user_id}
                    onClick={() => handleSelectProfessional(professional)}
                  >
                    <div className='flex items-center justify-between p-4'>
                      <div className='flex items-center gap-4'>
                        <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
                          {professional.profile.avatar_url ? (
                            <Image
                              alt={name}
                              className='h-full w-full object-cover'
                              height={48}
                              src={professional.profile.avatar_url}
                              unoptimized
                              width={48}
                            />
                          ) : (
                            <span className='text-lg font-semibold text-gray-500'>
                              {professional.profile.first_name?.charAt(0) ?? ''}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className='font-semibold text-gray-800'>{name}</p>
                          <p className='text-sm text-gray-600'>
                            {professional.profile.email}
                          </p>
                          {professional.city && (
                            <p className='text-sm text-gray-500'>
                              {professional.city}
                              {professional.postal_code &&
                                `, ${professional.postal_code}`}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500'>
                          <Check className='h-4 w-4 text-white' />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {searchQuery && professionals.length === 0 && (
          <div className='py-8 text-center text-gray-500'>
            <p>{t('search.noResults')}</p>
          </div>
        )}

        {!searchQuery && (
          <div className='py-8 text-center text-gray-500'>
            <p>{t('search.startSearching')}</p>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className='flex justify-end gap-4'>
        <Button onClick={handleCancel} variant='outline'>
          {t('cancel')}
        </Button>
        <Button
          className='bg-blue-400 text-white hover:bg-blue-500'
          disabled={!selectedProfessional || createInvitation.isPending}
          onClick={handleSubmit}
        >
          {createInvitation.isPending ? t('sending') : t('sendInvitation')}
        </Button>
      </div>
    </div>
  );
}
