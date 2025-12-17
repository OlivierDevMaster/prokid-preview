import type { StructureMemberFilters } from '@/features/structure-members/structureMember.model';

import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { getProfessionalsForStructure } from '@/features/structure-members/structureMember.service';

import type { StructureProfessionalCard } from '../modeles/professional.modele';

export const getStructureProfessionals = async (
  structureId: string,
  filters: StructureMemberFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<StructureProfessionalCard>> => {
  const result = await getProfessionalsForStructure(
    structureId,
    filters,
    paginationOptions
  );

  const professionals: StructureProfessionalCard[] = result.data.map(member => {
    const prof = member.professional;
    const profile = prof.profile;
    const name = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
        profile.email ||
        'Unknown'
      : 'Unknown';
    const location = `${prof.city}${prof.postal_code ? `, ${prof.postal_code}` : ''}`;

    return {
      avatarUrl: profile?.avatar_url,
      id: prof.user_id,
      location,
      name,
      professional: prof,
      skills: prof.skills || [],
    };
  });

  return {
    count: result.count,
    data: professionals,
  };
};
