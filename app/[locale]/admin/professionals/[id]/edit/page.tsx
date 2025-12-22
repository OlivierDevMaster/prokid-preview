'use client';

import { ArrowLeft, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { ProfessionalUpdate } from '@/features/professionals/professional.model';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import { useUpdateProfessional } from '@/features/professionals/hooks/useUpdateProfessional';
import { useUpdateProfile } from '@/features/profiles/hooks/useUpdateProfile';
import { Link } from '@/i18n/routing';

export default function AdminProfessionalEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations('admin.professionals');
  const tCommon = useTranslations('common');
  const tAdmin = useTranslations('admin');

  const { data: professional, isLoading } = useFindProfessional(id as string);
  const updateProfessional = useUpdateProfessional();
  const updateProfile = useUpdateProfile();
  const [formData, setFormData] = useState<Partial<ProfessionalUpdate>>({});
  const [profileData, setProfileData] = useState<{
    email: string;
    first_name: string;
    last_name: string;
  }>({
    email: '',
    first_name: '',
    last_name: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (professional) {
      setFormData({
        city: professional.city || '',
        description: professional.description || '',
        phone: professional.phone || '',
        postal_code: professional.postal_code || '',
      });
      setSkills(professional.skills || []);
      const profile = professional.profile;
      if (profile) {
        setProfileData({
          email: profile.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
        });
      }
    }
  }, [professional]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professional) return;

    try {
      const updatePromises = [];

      // Update profile (name and email)
      const profileUpdates: {
        email?: string;
        first_name?: string;
        last_name?: string;
      } = {};

      if (
        profileData.first_name !== professional.profile?.first_name ||
        profileData.last_name !== professional.profile?.last_name
      ) {
        profileUpdates.first_name = profileData.first_name.trim();
        profileUpdates.last_name = profileData.last_name.trim();
      }

      if (profileData.email !== professional.profile?.email) {
        profileUpdates.email = profileData.email.trim();
      }

      if (Object.keys(profileUpdates).length > 0) {
        updatePromises.push(
          updateProfile.mutateAsync({
            updateData: profileUpdates,
            userId: professional.user_id,
          })
        );
      }

      // Update professional (city, postal_code, description, phone, skills)
      const professionalUpdates: ProfessionalUpdate = {
        ...formData,
        skills: skills.length > 0 ? skills : null,
      };

      if (
        professionalUpdates.city !== professional.city ||
        professionalUpdates.postal_code !== professional.postal_code ||
        professionalUpdates.description !== professional.description ||
        professionalUpdates.phone !== professional.phone ||
        JSON.stringify(professionalUpdates.skills) !==
          JSON.stringify(professional.skills)
      ) {
        updatePromises.push(
          updateProfessional.mutateAsync({
            professionalId: professional.user_id,
            updateData: professionalUpdates,
          })
        );
      }

      await Promise.all(updatePromises);
      router.push(`/admin/professionals/${professional.user_id}`);
    } catch (error) {
      console.error('Error updating professional:', error);
    }
  };

  useEffect(() => {
    router.push(`/admin/professionals`);
  }, [router]);

  const handleCancel = () => {
    if (professional) {
      router.push(`/admin/professionals/${professional.user_id}`);
    } else {
      router.push('/admin/professionals');
    }
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white'>
        <Card className='p-8'>
          <h1 className='mb-4 text-2xl font-bold text-gray-800'>
            {t('notFound')}
          </h1>
          <Link href='/admin/professionals'>
            <Button>{t('backToList')}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='space-y-6 bg-blue-50/30 p-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Link href={`/admin/professionals/${professional.user_id}`}>
              <ArrowLeft className='h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800' />
            </Link>
            <h1 className='text-3xl font-bold text-gray-900'>
              {t('editProfessional')}
            </h1>
          </div>
          <div className='flex gap-3'>
            <Button
              className='border-gray-300 text-gray-700 hover:bg-gray-50'
              onClick={handleCancel}
              type='button'
              variant='outline'
            >
              <X className='mr-2 h-4 w-4' />
              {t('cancel')}
            </Button>
            <Button
              className='bg-blue-500 text-white hover:bg-blue-600'
              disabled={updateProfessional.isPending || updateProfile.isPending}
              type='submit'
            >
              <Save className='mr-2 h-4 w-4' />
              {updateProfessional.isPending || updateProfile.isPending
                ? t('updating')
                : t('update')}
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>{t('personalInformation')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-2'>
                <Label className='text-sm font-semibold' htmlFor='first_name'>
                  {tCommon('label.firstName')}
                </Label>
                <Input
                  id='first_name'
                  onChange={e =>
                    setProfileData({
                      ...profileData,
                      first_name: e.target.value,
                    })
                  }
                  value={profileData.first_name}
                />
              </div>
              <div className='grid gap-2'>
                <Label className='text-sm font-semibold' htmlFor='last_name'>
                  {tCommon('label.lastName')}
                </Label>
                <Input
                  id='last_name'
                  onChange={e =>
                    setProfileData({
                      ...profileData,
                      last_name: e.target.value,
                    })
                  }
                  value={profileData.last_name}
                />
              </div>
              <div className='grid gap-2'>
                <Label className='text-sm font-semibold' htmlFor='email'>
                  {t('email')}
                </Label>
                <Input
                  id='email'
                  onChange={e =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  type='email'
                  value={profileData.email}
                />
              </div>
              <div className='grid gap-2'>
                <Label className='text-sm font-semibold' htmlFor='phone'>
                  {t('phone')}
                </Label>
                <Input
                  id='phone'
                  onChange={e =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  type='tel'
                  value={formData.phone || ''}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle>{t('professionalInformation')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-2'>
                <Label className='text-sm font-semibold' htmlFor='city'>
                  {t('city')}
                </Label>
                <Input
                  id='city'
                  onChange={e =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  value={formData.city || ''}
                />
              </div>
              <div className='grid gap-2'>
                <Label className='text-sm font-semibold' htmlFor='postal_code'>
                  {t('postalCode')}
                </Label>
                <Input
                  id='postal_code'
                  onChange={e =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  value={formData.postal_code || ''}
                />
              </div>
              <div className='grid gap-2'>
                <Label className='text-sm font-semibold' htmlFor='skills'>
                  {t('skills')}
                </Label>
                <div className='space-y-2'>
                  <div className='flex flex-wrap gap-2'>
                    {skills.map((skill, index) => (
                      <Badge
                        className='flex items-center gap-1'
                        key={index}
                        variant='secondary'
                      >
                        {skill}
                        <button
                          className='ml-1 rounded-full hover:bg-gray-300'
                          onClick={() => handleRemoveSkill(skill)}
                          type='button'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className='flex gap-2'>
                    <Input
                      id='skills'
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      placeholder={tAdmin('setting.addSkillPlaceholder')}
                      value={newSkill}
                    />
                    <Button
                      onClick={handleAddSkill}
                      type='button'
                      variant='outline'
                    >
                      {tCommon('actions.add') || 'Add'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>{t('description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-2'>
                <Label className='text-sm font-semibold' htmlFor='description'>
                  {t('description')}
                </Label>
                <Textarea
                  className='min-h-[150px]'
                  id='description'
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  value={formData.description || ''}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations supplémentaires */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>{t('additionalInformation')}</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {professional.created_at && (
                <div>
                  <label className='text-sm font-semibold text-gray-700'>
                    {t('createdAt')}
                  </label>
                  <p className='text-gray-900'>
                    {new Date(professional.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {professional.updated_at && (
                <div>
                  <label className='text-sm font-semibold text-gray-700'>
                    {t('updatedAt')}
                  </label>
                  <p className='text-gray-900'>
                    {new Date(professional.updated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
