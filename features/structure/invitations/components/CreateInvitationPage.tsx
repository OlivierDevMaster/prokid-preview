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

import { useCreateInvitations } from '../hooks/useCreateInvitation';

export function CreateInvitationPage() {
  const t = useTranslations('structure.invitations');
  const tCommon = useTranslations('common.messages');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<
    Set<string>
  >(new Set());

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

  const createInvitations = useCreateInvitations();

  const handleToggleProfessional = (professional: Professional) => {
    setSelectedProfessionalIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(professional.user_id)) {
        newSet.delete(professional.user_id);
      } else {
        newSet.add(professional.user_id);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (selectedProfessionalIds.size === 0) {
      toast.error(t('errors.selectProfessional'));
      return;
    }

    try {
      await createInvitations.mutateAsync({
        professional_ids: Array.from(selectedProfessionalIds),
        status: 'pending',
      });
      toast.success(
        t('success.invitationsSent', { count: selectedProfessionalIds.size })
      );
      router.push('/structure/missions');
    } catch (error) {
      toast.error(t('errors.failedToSend'));
      console.error('Failed to create invitations:', error);
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
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-gray-700'>
                {t('search.results', { count: professionals.length })}
              </p>
              {selectedProfessionalIds.size > 0 && (
                <p className='text-sm font-medium text-blue-600'>
                  {t('selected', { count: selectedProfessionalIds.size })}
                </p>
              )}
            </div>
            <div className='max-h-96 space-y-2 overflow-y-auto'>
              {professionals.map(professional => {
                const isSelected = selectedProfessionalIds.has(
                  professional.user_id
                );
                const name =
                  `${professional.profile.first_name || ''} ${professional.profile.last_name || ''}`.trim() ||
                  professional.profile.email ||
                  tCommon('unknown');

                return (
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    key={professional.user_id}
                    onClick={() => handleToggleProfessional(professional)}
                  >
                    <div className='flex items-center justify-between p-4'>
                      <div className='flex items-center gap-4'>
                        <div className='flex h-6 w-6 items-center justify-center'>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <Check className='h-3 w-3 text-white' />
                            )}
                          </div>
                        </div>
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
          disabled={
            selectedProfessionalIds.size === 0 || createInvitations.isPending
          }
          onClick={handleSubmit}
        >
          {createInvitations.isPending
            ? t('sending')
            : selectedProfessionalIds.size > 0
              ? t('sendInvitations', { count: selectedProfessionalIds.size })
              : t('sendInvitation')}
        </Button>
      </div>
    </div>
  );
}
