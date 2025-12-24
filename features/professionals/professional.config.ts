export const ProfessionalConfig = {
  PAGE_DEFAULT: 1,
  PAGE_SIZE_DEFAULT: 50,
};

type ProfessionalSkill =
  | 'childcare_auxiliary_nurse'
  | 'childhood_education_and_care_assistant_certificate'
  | 'early_childhood_educator'
  | 'health_and_inclusive_care_coordinator'
  | 'other_early_childhood_profession'
  | 'pediatric_nurse'
  | 'psychomotor_therapist';

export const ProfessionalSkills: ProfessionalSkill[] = [
  'health_and_inclusive_care_coordinator',
  'early_childhood_educator',
  'psychomotor_therapist',
  'pediatric_nurse',
  'childhood_education_and_care_assistant_certificate',
  'childcare_auxiliary_nurse',
  'other_early_childhood_profession',
];
