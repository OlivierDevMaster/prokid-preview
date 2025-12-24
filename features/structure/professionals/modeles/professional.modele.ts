import type { Professional } from '@/features/professionals/professional.model';
import type { StructureMemberWithProfessional } from '@/features/structure-members/structureMember.model';

export type StructureProfessional =
  StructureMemberWithProfessional['professional'];

export interface StructureProfessionalCard {
  avatarUrl?: null | string;
  id: string;
  location: string;
  name: string;
  professional: Professional;
  skills: string[];
}
