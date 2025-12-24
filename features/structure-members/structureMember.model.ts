import type { Professional } from '@/features/professionals/professional.model';
import type { Structure } from '@/features/structures/structure.model';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

export type StructureMember = Tables<'structure_members'>;

export interface StructureMemberFilters {
  includeDeleted?: boolean;
}

export type StructureMemberInsert = TablesInsert<'structure_members'>;

export type StructureMemberUpdate = TablesUpdate<'structure_members'>;

export type StructureMemberWithProfessional = {
  professional: Professional;
} & StructureMember;
export type StructureMemberWithStructure = {
  structure: Structure;
} & StructureMember;
