import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';
import {
  ProfessionalFilters,
  ProfessionalsWithProfilesSearch,
} from '@/features/professionals/professional.model';
import { ProfessionalWithDistance } from '@/features/professionals/types/nearby-professionals.types';

import {
  getNearbyProfessionalsFromStructure,
  getProfessionalsByUserIdsRequest,
} from '../professional.service';

type NearbyProfessionalsResult = {
  count: number;
  data: ProfessionalWithDistance[];
};

const toProfessionalWithDistance = (
  row: ProfessionalsWithProfilesSearch
): ProfessionalWithDistance => {
  const {
    avatar_url,
    first_name,
    is_onboarded,
    last_name,
    profile_created_at,
    profile_email,
    profile_role,
    ...professionalData
  } = row;

  return {
    ...professionalData,
    distance_km: 0,
    is_default_case: false,
    profile: {
      avatar_url,
      created_at: profile_created_at,
      email: profile_email,
      first_name,
      is_onboarded,
      last_name,
      role: profile_role,
      user_id: row.user_id,
    },
  } as ProfessionalWithDistance;
};

const matchesFilters = (
  professional: ProfessionalWithDistance,
  filters: ProfessionalFilters
) => {
  const normalizedSearch = filters.search?.trim().toLowerCase();
  const normalizedLocation = filters.locationSearch?.trim().toLowerCase();

  if (normalizedSearch) {
    const searchSource = [
      professional.profile.first_name ?? '',
      professional.profile.last_name ?? '',
      professional.profile.email ?? '',
      professional.description ?? '',
    ]
      .join(' ')
      .toLowerCase();

    if (!searchSource.includes(normalizedSearch)) {
      return false;
    }
  }

  if (normalizedLocation) {
    const locationSource = [
      professional.city ?? '',
      professional.postal_code ?? '',
    ]
      .join(' ')
      .toLowerCase();

    if (!locationSource.includes(normalizedLocation)) {
      return false;
    }
  }

  if (filters.current_job && professional.current_job !== filters.current_job) {
    return false;
  }

  if (
    filters.availability &&
    filters.availability !== 'all' &&
    !professional.is_available
  ) {
    return false;
  }

  return true;
};

export const useFindNearbyProfessionalsFromStructure = (
  structureId: null | string | undefined,
  filters: ProfessionalFilters = {},
  options: { radiusKm?: number } & PaginationOptions = {}
) => {
  const { enabled = true, limit = 12, page = 1, radiusKm = 10 } = options;

  return useQuery<NearbyProfessionalsResult>({
    enabled: enabled && !!structureId,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!structureId) {
        return { count: 0, data: [] };
      }

      const nearbyRows = await getNearbyProfessionalsFromStructure(structureId);
      const orderedUserIds = nearbyRows.map(row => row.user_id);
      const distanceByUserId = new Map(
        nearbyRows.map(row => [row.user_id, row.distance_km])
      );
      const defaultCaseByUserId = new Map(
        nearbyRows.map(row => [row.user_id, row.is_default_case])
      );

      const profileRows =
        await getProfessionalsByUserIdsRequest(orderedUserIds);
      const professionalByUserId = new Map(
        profileRows.map(row => [row.user_id, toProfessionalWithDistance(row)])
      );

      const merged = orderedUserIds
        .map(userId => {
          const professional = professionalByUserId.get(userId);
          const distance = distanceByUserId.get(userId);

          if (!professional || typeof distance !== 'number') {
            return null;
          }

          return {
            ...professional,
            distance_km: distance,
            is_default_case: defaultCaseByUserId.get(userId) ?? false,
          };
        })
        .filter((row): row is ProfessionalWithDistance => row !== null)
        .filter(row => matchesFilters(row, filters));

      const from = (page - 1) * limit;
      const paginated = merged.slice(from, from + limit);

      return {
        count: merged.length,
        data: paginated,
      };
    },
    queryKey: [
      'nearby-professionals-from-structure',
      structureId,
      filters,
      page,
      limit,
      radiusKm,
    ],
  });
};
