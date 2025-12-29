import { rrulestr } from 'rrule';

import { createClient } from '@/lib/supabase/client';

import type {
  Professional,
  ProfessionalFilters,
  ProfessionalInsert,
  ProfessionalsWithProfilesSearch,
  ProfessionalUpdate,
} from './professional.model';

import {
  PaginationOptions,
  PaginationResult,
} from '../paginations/pagination.model';
import { ProfessionalConfig } from './professional.config';

/**
 * Extracts DTSTART from rrule string if dtstart is not present
 * @param rrule - RRULE string (RFC 5545 format)
 * @param dtstart - Existing dtstart value (may be null)
 * @returns Date object or null
 */
const extractDtstartFromRrule = (
  rrule: null | string,
  dtstart: null | string
): Date | null => {
  // If dtstart exists, use it
  if (dtstart) {
    return new Date(dtstart);
  }

  // If no rrule, return null
  if (!rrule) {
    return null;
  }

  try {
    // Extract parseable parts (DTSTART and RRULE lines)
    const lines = rrule.split('\n');
    const parseableLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DTSTART:') || trimmed.startsWith('RRULE:')) {
        parseableLines.push(trimmed);
      }
    }

    if (parseableLines.length === 0) {
      return null;
    }

    const parseableRRULE = parseableLines.join('\n');
    const rule = rrulestr(parseableRRULE);

    // Return dtstart from the parsed rule
    return rule.options.dtstart || null;
  } catch (error) {
    console.error('Error parsing RRULE:', error);
    return null;
  }
};

export const createProfessional = async (
  insertData: ProfessionalInsert
): Promise<Professional> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professionals')
    .insert(insertData)
    .select(
      `
        *,
        profile:profiles(*)
      `
    )
    .single();

  if (error) throw error;

  return data;
};

export const findProfessional = async (
  userId: string
): Promise<null | Professional> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professionals')
    .select(
      `
        *,
        profile:profiles(*)
      `
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const updateProfessional = async (
  userId: string,
  updateData: ProfessionalUpdate
): Promise<Professional> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professionals')
    .update(updateData)
    .eq('user_id', userId)
    .select(
      `
      *,
      profile:profiles(*)
    `
    )
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  return data;
};

export const getProfessionals = async (
  filters: ProfessionalFilters,
  paginationOptions: PaginationOptions
): Promise<PaginationResult<Professional>> => {
  try {
    const supabase = createClient();

    let query = supabase
      .from('professionals_with_profiles_search')
      .select('*', { count: 'exact' });

    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      query = query.or(
        `description.ilike.${searchPattern},first_name.ilike.${searchPattern},last_name.ilike.${searchPattern}`
      );
    }

    if (filters.locationSearch) {
      const locationSearchPattern = `%${filters.locationSearch}%`;
      query = query.or(
        `city.ilike.${locationSearchPattern},postal_code.ilike.${locationSearchPattern}`
      );
    }

    if (filters.current_job) {
      query = query.eq('current_job', filters.current_job);
    }

    // Filter by availability if specified
    if (filters.availability && filters.availability !== 'all') {
      // Filter professionals by availability criteria

      switch (filters.availability) {
        case 'afternoon': {
          // Afternoon: professionals with availabilities starting between 12:00 and 18:00
          const { data: allAvailabilities, error: availError } = await supabase
            .from('availabilities')
            .select('dtstart, rrule, user_id');

          if (availError) {
            console.error('Error fetching availabilities:', availError);
            return { count: 0, data: [] };
          }

          const afternoonUserIds = new Set<string>();
          (allAvailabilities || []).forEach(av => {
            const dtstart = extractDtstartFromRrule(av.rrule, av.dtstart);
            if (dtstart) {
              const hour = dtstart.getUTCHours();
              if (hour >= 12 && hour < 18 && av.user_id) {
                afternoonUserIds.add(av.user_id);
              }
            }
          });

          if (afternoonUserIds.size === 0) {
            return { count: 0, data: [] };
          }

          query = query.in('user_id', Array.from(afternoonUserIds));
          break;
        }
        case 'fullDay': {
          // Full day: professionals with availabilities >= 8 hours (480 minutes)
          const { data: fullDayAvailabilities, error: availError } =
            await supabase
              .from('availabilities')
              .select('user_id')
              .gte('duration_mn', 480);

          if (availError) {
            console.error('Error fetching availabilities:', availError);
            return { count: 0, data: [] };
          }

          const fullDayUserIds = [
            ...new Set(
              (fullDayAvailabilities || [])
                .map(av => av.user_id)
                .filter(Boolean)
            ),
          ];

          if (fullDayUserIds.length === 0) {
            return { count: 0, data: [] };
          }

          query = query.in('user_id', fullDayUserIds);
          break;
        }
        case 'morning': {
          // Morning: professionals with availabilities starting before 12:00
          const { data: allAvailabilities, error: availError } = await supabase
            .from('availabilities')
            .select('dtstart, rrule, user_id');

          if (availError) {
            console.error('Error fetching availabilities:', availError);
            return { count: 0, data: [] };
          }

          const morningUserIds = new Set<string>();
          (allAvailabilities || []).forEach(av => {
            const dtstart = extractDtstartFromRrule(av.rrule, av.dtstart);
            if (dtstart) {
              const hour = dtstart.getUTCHours();
              if (hour < 12 && av.user_id) {
                morningUserIds.add(av.user_id);
              }
            }
          });

          if (morningUserIds.size === 0) {
            return { count: 0, data: [] };
          }

          query = query.in('user_id', Array.from(morningUserIds));
          break;
        }
        case 'weekend': {
          // Weekend: professionals with availabilities on Saturday or Sunday
          const { data: allAvailabilities, error: availError } = await supabase
            .from('availabilities')
            .select('dtstart, rrule, user_id');

          if (availError) {
            console.error('Error fetching availabilities:', availError);
            return { count: 0, data: [] };
          }

          const weekendUserIds = new Set<string>();
          (allAvailabilities || []).forEach(av => {
            const dtstart = extractDtstartFromRrule(av.rrule, av.dtstart);
            if (dtstart) {
              const dayOfWeek = dtstart.getUTCDay(); // 0 = Sunday, 6 = Saturday
              if ((dayOfWeek === 0 || dayOfWeek === 6) && av.user_id) {
                weekendUserIds.add(av.user_id);
              }
            }
          });

          if (weekendUserIds.size === 0) {
            return { count: 0, data: [] };
          }

          query = query.in('user_id', Array.from(weekendUserIds));
          break;
        }
      }
    }

    const page = paginationOptions.page ?? ProfessionalConfig.PAGE_DEFAULT;

    const limit =
      paginationOptions.limit ?? ProfessionalConfig.PAGE_SIZE_DEFAULT;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .order('user_id', { ascending: false })
      .range(from, to);

    const { count, data, error } = await query;

    if (error) throw error;

    // Transform flat view data to nested Professional structure
    const transformedData: Professional[] =
      (data as null | ProfessionalsWithProfilesSearch[])?.map(row => {
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
        } as Professional;
      }) ?? [];
    return {
      count: count ?? 0,
      data: transformedData,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteProfessional = async (userId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};
