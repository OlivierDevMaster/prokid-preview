import { useTranslations } from 'next-intl';

export default function useGetProfessionalJobs() {
  const t = useTranslations('professional');

  const jobs = [
    {
      label: t('jobs.health_and_inclusive_care_coordinator'),
      value: 'health_and_inclusive_care_coordinator',
    },
    {
      label: t('jobs.early_childhood_educator'),
      value: 'early_childhood_educator',
    },
    { label: t('jobs.psychomotor_therapist'), value: 'psychomotor_therapist' },
    { label: t('jobs.pediatric_nurse'), value: 'pediatric_nurse' },
    {
      label: t('jobs.childhood_education_and_care_assistant_certificate'),
      value: 'childhood_education_and_care_assistant_certificate',
    },
    {
      label: t('jobs.childcare_auxiliary_nurse'),
      value: 'childcare_auxiliary_nurse',
    },
    {
      label: t('jobs.other_early_childhood_profession'),
      value: 'other_early_childhood_profession',
    },
  ];

  return jobs;
}
