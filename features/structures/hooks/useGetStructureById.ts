'use client';

import { useQuery } from '@tanstack/react-query';

import type { Structure } from '../structure.model';

import { findStructure } from '../structure.service';

export const useGetStructureById = (structureId: null | string) => {
  return useQuery<null | Structure>({
    enabled: !!structureId,
    queryFn: () => (structureId ? findStructure(structureId) : null),
    queryKey: ['structure', structureId],
  });
};
