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
