import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { createClient } from '@/lib/supabase/client';

import type {
  CreateStructureInvitationRequestBody,
  StructureInvitation,
  StructureInvitationFilters,
  StructureInvitationUpdate,
} from './structureInvitation.model';

import { StructureInvitationConfig } from './structureInvitation.config';
import { InvitationStatus } from './structureInvitation.model';

export const createStructureInvitation = async (
  body: CreateStructureInvitationRequestBody
): Promise<StructureInvitation> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('structure_invitations')
    .insert({
      professional_id: body.professional_id,
      status: body.status ?? 'pending',
      structure_id: body.structure_id,
    })
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const createStructureInvitations = async (
  body: {
    professional_ids: string[];
  } & Omit<CreateStructureInvitationRequestBody, 'professional_id'>
): Promise<StructureInvitation[]> => {
  const supabase = createClient();

  const invitations = body.professional_ids.map(professional_id => ({
    professional_id,
    status: body.status ?? 'pending',
    structure_id: body.structure_id,
  }));

  const { data, error } = await supabase
    .from('structure_invitations')
    .insert(invitations)
    .select('*');

  if (error) throw error;

  return data ?? [];
};

export const findStructureInvitation = async (
  invitationId: string
): Promise<null | StructureInvitation> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('structure_invitations')
    .select('*')
    .eq('id', invitationId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const findStructureInvitations = async (
  filters: StructureInvitationFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<StructureInvitation>> => {
  const supabase = createClient();

  let query = supabase
    .from('structure_invitations')
    .select('*', { count: 'exact' });

  if (filters.structure_id) {
    query = query.eq('structure_id', filters.structure_id);
  }

  if (filters.professional_id) {
    query = query.eq('professional_id', filters.professional_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const page = paginationOptions.page ?? StructureInvitationConfig.PAGE_DEFAULT;

  const limit =
    paginationOptions.limit ?? StructureInvitationConfig.PAGE_SIZE_DEFAULT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: data ?? [],
  };
};

export const updateStructureInvitation = async (
  invitationId: string,
  updateData: StructureInvitationUpdate
): Promise<StructureInvitation> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('structure_invitations')
    .update(updateData)
    .eq('id', invitationId)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};

export const acceptStructureInvitation = async (
  invitationId: string
): Promise<StructureInvitation> => {
  return updateStructureInvitation(invitationId, {
    status: InvitationStatus.accepted,
  });
};

export const declineStructureInvitation = async (
  invitationId: string
): Promise<StructureInvitation> => {
  return updateStructureInvitation(invitationId, {
    status: InvitationStatus.declined,
  });
};

export const deleteStructureInvitation = async (
  invitationId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('structure_invitations')
    .delete()
    .eq('id', invitationId);

  if (error) throw error;
};

export interface StructureInvitationWithStructure {
  created_at: string;
  id: string;
  professional_id: string;
  status: 'accepted' | 'declined' | 'pending';
  structure: {
    name: null | string;
    profile: {
      avatar_url: null | string;
      email: string;
    } | null;
    user_id: string;
  } | null;
  structure_id: string;
  updated_at: string;
}

export const findStructureInvitationsWithStructure = async (
  filters: StructureInvitationFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<StructureInvitationWithStructure>> => {
  const supabase = createClient();

  let query = supabase.from('structure_invitations').select(
    `
      *,
      structure:structures(
        user_id,
        name,
        profile:profiles(
          avatar_url,
          email
        )
      )
    `,
    { count: 'exact' }
  );

  if (filters.structure_id) {
    query = query.eq('structure_id', filters.structure_id);
  }

  if (filters.professional_id) {
    query = query.eq('professional_id', filters.professional_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const page = paginationOptions.page ?? StructureInvitationConfig.PAGE_DEFAULT;

  const limit =
    paginationOptions.limit ?? StructureInvitationConfig.PAGE_SIZE_DEFAULT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: (data ?? []) as StructureInvitationWithStructure[],
  };
};

export interface StructureInvitationWithProfessional {
  created_at: string;
  id: string;
  professional: {
    profile: {
      avatar_url: null | string;
      email: string;
      first_name: null | string;
      last_name: null | string;
    } | null;
    user_id: string;
  } | null;
  professional_id: string;
  status: 'accepted' | 'declined' | 'pending';
  structure_id: string;
  updated_at: string;
}

export const findStructureInvitationsWithProfessional = async (
  filters: StructureInvitationFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<StructureInvitationWithProfessional>> => {
  const supabase = createClient();

  let query = supabase.from('structure_invitations').select(
    `
      *,
      professional:professionals!structure_invitations_professional_id_fkey(
        user_id,
        profile:profiles!professionals_user_id_fkey(
          avatar_url,
          email,
          first_name,
          last_name
        )
      )
    `,
    { count: 'exact' }
  );

  if (filters.structure_id) {
    query = query.eq('structure_id', filters.structure_id);
  }

  if (filters.professional_id) {
    query = query.eq('professional_id', filters.professional_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const page = paginationOptions.page ?? StructureInvitationConfig.PAGE_DEFAULT;

  const limit =
    paginationOptions.limit ?? StructureInvitationConfig.PAGE_SIZE_DEFAULT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: (data ?? []) as StructureInvitationWithProfessional[],
  };
};
