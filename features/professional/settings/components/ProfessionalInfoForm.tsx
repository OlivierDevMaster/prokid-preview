'use client';

import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFindProfessional } from '@/features/professionals/hooks/useFindProfessional';
import useGetProfessionalJobs from '@/features/professionals/hooks/useGetProfessionalJobs';
import { useUpdateProfessional } from '@/features/professionals/hooks/useUpdateProfessional';

export function ProfessionalInfoForm() {
  const t = useTranslations('common');
  const tAdmin = useTranslations('admin');
  const tProfessional = useTranslations('professional');
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [interventionRadius, setInterventionRadius] = useState('');
  const [currentJob, setCurrentJob] = useState('');
  const [description, setDescription] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const updateProfessionalMutation = useUpdateProfessional();
  const professionalJobs = useGetProfessionalJobs();

  const { data: professional } = useFindProfessional(session?.user?.id);

  const currentCity = professional?.city || '';
  const currentPostalCode = professional?.postal_code || '';
  const currentInterventionRadius =
    professional?.intervention_radius_km?.toString() || '';
  const currentJobValue = professional?.current_job || '';
  const currentDescription = professional?.description || '';
  const currentExperienceYears =
    professional?.experience_years?.toString() || '';
  const currentHourlyRate = professional?.hourly_rate?.toString() || '';
  const currentSkills = professional?.skills || [];

  const handleUpdateClick = () => {
    setCity(currentCity);
    setPostalCode(currentPostalCode);
    setInterventionRadius(currentInterventionRadius);
    setCurrentJob(currentJobValue);
    setDescription(currentDescription);
    setExperienceYears(currentExperienceYears);
    setHourlyRate(currentHourlyRate);
    setSkills([...currentSkills]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setCity('');
    setPostalCode('');
    setInterventionRadius('');
    setCurrentJob('');
    setDescription('');
    setExperienceYears('');
    setHourlyRate('');
    setSkills([]);
    setNewSkill('');
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
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

  const handleSave = async () => {
    if (!session?.user?.id || !professional) {
      return;
    }

    const hasFormChanges =
      city !== currentCity ||
      postalCode !== currentPostalCode ||
      interventionRadius !== currentInterventionRadius ||
      currentJob !== currentJobValue ||
      description !== currentDescription ||
      experienceYears !== currentExperienceYears ||
      hourlyRate !== currentHourlyRate ||
      JSON.stringify(skills.sort()) !==
        JSON.stringify([...currentSkills].sort());

    if (!hasFormChanges) {
      setIsEditing(false);
      return;
    }

    if (!city.trim()) {
      return;
    }

    try {
      const updateData: {
        city?: string;
        current_job?: null | string;
        description?: null | string;
        experience_years?: number;
        hourly_rate?: number;
        intervention_radius_km?: number;
        postal_code?: null | string;
        skills?: null | string[];
      } = {};

      if (city !== currentCity) {
        updateData.city = city.trim();
      }

      if (postalCode !== currentPostalCode) {
        updateData.postal_code = postalCode.trim() || null;
      }

      if (interventionRadius !== currentInterventionRadius) {
        const radius = parseFloat(interventionRadius);
        if (!isNaN(radius) && radius >= 5 && radius <= 100) {
          updateData.intervention_radius_km = radius;
        }
      }

      if (currentJob !== currentJobValue) {
        updateData.current_job = currentJob || null;
      }

      if (description !== currentDescription) {
        updateData.description = description.trim() || null;
      }

      if (experienceYears !== currentExperienceYears) {
        const years = parseFloat(experienceYears);
        if (!isNaN(years) && years >= 0) {
          updateData.experience_years = years;
        }
      }

      if (hourlyRate !== currentHourlyRate) {
        const rate = parseFloat(hourlyRate);
        if (!isNaN(rate) && rate >= 0) {
          updateData.hourly_rate = rate;
        }
      }

      if (
        JSON.stringify(skills.sort()) !==
        JSON.stringify([...currentSkills].sort())
      ) {
        updateData.skills = skills.length > 0 ? skills : null;
      }

      await updateProfessionalMutation.mutateAsync({
        professionalId: session.user.id,
        updateData,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating professional info:', error);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-bold text-blue-900'>
          {tAdmin('setting.professionalInformation')}
        </h2>
        {!isEditing && (
          <Button onClick={handleUpdateClick} size='sm' variant='outline'>
            {t('actions.edit')}
          </Button>
        )}
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700' htmlFor='city'>
            {tAdmin('professionals.city')} *
          </Label>
          <Input
            className='w-full'
            disabled={!isEditing}
            id='city'
            onChange={e => setCity(e.target.value)}
            placeholder={tAdmin('professionals.cityPlaceholder')}
            readOnly={!isEditing}
            type='text'
            value={isEditing ? city : currentCity}
          />
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='postalCode'
          >
            {tAdmin('professionals.postalCode')}
          </Label>
          <Input
            className='w-full'
            disabled={!isEditing}
            id='postalCode'
            onChange={e => setPostalCode(e.target.value)}
            placeholder={tAdmin('professionals.postalCodePlaceholder')}
            readOnly={!isEditing}
            type='text'
            value={isEditing ? postalCode : currentPostalCode}
          />
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='interventionRadius'
          >
            {tAdmin('setting.interventionRadius')} (km) *
          </Label>
          <Input
            className='w-full'
            disabled={!isEditing}
            id='interventionRadius'
            max={100}
            min={5}
            onChange={e => setInterventionRadius(e.target.value)}
            placeholder='25'
            readOnly={!isEditing}
            type='number'
            value={isEditing ? interventionRadius : currentInterventionRadius}
          />
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='currentJob'
          >
            {tProfessional('job')}
          </Label>
          {isEditing ? (
            <Select
              onValueChange={value => setCurrentJob(value || '')}
              value={currentJob || undefined}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={tAdmin('setting.selectProfession')} />
              </SelectTrigger>
              <SelectContent>
                {professionalJobs.map(job => (
                  <SelectItem key={job.value} value={job.value}>
                    {job.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              className='w-full'
              disabled
              id='currentJob'
              readOnly
              type='text'
              value={
                professionalJobs.find(job => job.value === currentJobValue)
                  ?.label ||
                currentJobValue ||
                ''
              }
            />
          )}
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='experienceYears'
          >
            {tAdmin('setting.experienceYears')} *
          </Label>
          <Input
            className='w-full'
            disabled={!isEditing}
            id='experienceYears'
            min={0}
            onChange={e => setExperienceYears(e.target.value)}
            placeholder='5'
            readOnly={!isEditing}
            type='number'
            value={isEditing ? experienceYears : currentExperienceYears}
          />
        </div>

        <div className='space-y-2'>
          <Label
            className='text-sm font-medium text-gray-700'
            htmlFor='hourlyRate'
          >
            {tAdmin('setting.hourlyRate')} (€) *
          </Label>
          <Input
            className='w-full'
            disabled={!isEditing}
            id='hourlyRate'
            min={0}
            onChange={e => setHourlyRate(e.target.value)}
            placeholder='25.50'
            readOnly={!isEditing}
            step='0.01'
            type='number'
            value={isEditing ? hourlyRate : currentHourlyRate}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label
          className='text-sm font-medium text-gray-700'
          htmlFor='description'
        >
          {tAdmin('professionals.description')}
        </Label>
        <Textarea
          className='w-full'
          disabled={!isEditing}
          id='description'
          onChange={e => setDescription(e.target.value)}
          placeholder={tAdmin('professionals.descriptionPlaceholder')}
          readOnly={!isEditing}
          rows={4}
          value={isEditing ? description : currentDescription}
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-medium text-gray-700'>
          {tAdmin('professionals.skills')}
        </Label>
        {!isEditing ? (
          <div className='flex flex-wrap gap-2'>
            {currentSkills.length > 0 ? (
              currentSkills.map((skill, index) => (
                <Badge
                  className='border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  key={index}
                  variant='outline'
                >
                  {skill}
                </Badge>
              ))
            ) : (
              <p className='text-sm text-gray-500'>
                {tAdmin('setting.noSkills')}
              </p>
            )}
          </div>
        ) : (
          <div className='space-y-2'>
            <div className='flex flex-wrap gap-2'>
              {skills.map((skill, index) => (
                <Badge
                  className='flex items-center gap-1 border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  key={index}
                  variant='outline'
                >
                  {skill}
                  <button
                    className='ml-1 rounded-full hover:bg-gray-200'
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
                className='flex-1'
                onChange={e => setNewSkill(e.target.value)}
                onKeyPress={handleSkillKeyPress}
                placeholder={tAdmin('setting.addSkillPlaceholder')}
                type='text'
                value={newSkill}
              />
              <Button
                onClick={handleAddSkill}
                size='sm'
                type='button'
                variant='outline'
              >
                {t('actions.add')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className='flex justify-end gap-2'>
          <Button onClick={handleCancel} size='sm' variant='outline'>
            {t('actions.cancel')}
          </Button>
          <Button
            className='bg-blue-500 text-white hover:bg-blue-600'
            disabled={
              updateProfessionalMutation.isPending ||
              !city.trim() ||
              !interventionRadius ||
              !experienceYears ||
              !hourlyRate
            }
            onClick={handleSave}
            size='sm'
          >
            {updateProfessionalMutation.isPending
              ? t('messages.saving')
              : t('actions.save')}
          </Button>
        </div>
      )}
    </div>
  );
}
