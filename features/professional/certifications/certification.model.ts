import type { Tables, TablesInsert, TablesUpdate } from '@/types/database/schema';

export type ProfessionalCertification = Tables<'professional_certifications'>;
export type ProfessionalCertificationInsert = TablesInsert<'professional_certifications'>;
export type ProfessionalCertificationUpdate = TablesUpdate<'professional_certifications'>;
