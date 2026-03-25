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

// Haversine distance in km between two lat/lng points
function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type NearbyProfessionalsResult = {
  count: number;
  data: ProfessionalWithDistance[];
  locationFallback?: boolean;
  locationQuery?: string;
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

      const allMerged = orderedUserIds
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
        .filter((row): row is ProfessionalWithDistance => row !== null);

      // If we have city coordinates, recalculate distances from that city
      // and sort by proximity — no text filtering needed
      const locationCoords = filters.locationCoords;
      let results: ProfessionalWithDistance[];

      if (locationCoords) {
        // Apply all filters EXCEPT location text
        const filtersWithoutLocation = { ...filters, locationSearch: undefined };
        results = allMerged
          .filter(row => matchesFilters(row, filtersWithoutLocation))
          .map(row => {
            const proLat = (row as unknown as { latitude?: number }).latitude;
            const proLon = (row as unknown as { longitude?: number }).longitude;
            const dist =
              proLat != null && proLon != null
                ? Math.round(haversineKm(locationCoords.latitude, locationCoords.longitude, proLat, proLon))
                : row.distance_km;
            return { ...row, distance_km: dist };
          })
          .sort((a, b) => a.distance_km - b.distance_km);
      } else {
        // No city coords — use standard text-based filtering
        results = allMerged.filter(row => matchesFilters(row, filters));
      }

      const locationFallback = false;

      const from = (page - 1) * limit;
      const paginated = results.slice(from, from + limit);

      return {
        count: results.length,
        data: paginated,
        locationFallback,
        locationQuery: filters.locationSearch,
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
