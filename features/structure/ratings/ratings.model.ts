import type { Professional } from '@/features/professionals/professional.model';
import type { StructureMember } from '@/features/structure-members/structureMember.model';
import type { Structure } from '@/features/structures/structure.model';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

export type ProfessionalRating = Tables<'professional_ratings'>;

export type ProfessionalRatingInsert = TablesInsert<'professional_ratings'>;

export type ProfessionalRatingUpdate = TablesUpdate<'professional_ratings'>;

export type ProfessionalRatingWithRelations = {
  membership: StructureMember;
  professional: Professional;
  structure: Structure;
} & ProfessionalRating;
