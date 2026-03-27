import type { Tables, TablesInsert, TablesUpdate } from '@/types/database/schema';

export type ProfessionalExperience = Tables<'professional_experiences'>;
export type ProfessionalExperienceInsert = TablesInsert<'professional_experiences'>;
export type ProfessionalExperienceUpdate = TablesUpdate<'professional_experiences'>;
