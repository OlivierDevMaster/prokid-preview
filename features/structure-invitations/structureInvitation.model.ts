import { createEnumConstants } from '@/lib/utils/enums';
import {
  Constants,
  type Enums,
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from '@/types/database/schema';

export type InvitationStatus = Enums<'invitation_status'>;

export const InvitationStatus = createEnumConstants(
  Constants.public.Enums.invitation_status
);

export const InvitationStatuses = Constants.public.Enums.invitation_status;

export const InvitationStatusLabel: Record<
  'en' | 'fr',
  Record<InvitationStatus, string>
> = {
  en: {
    [InvitationStatus.accepted]: 'Accepted',
    [InvitationStatus.declined]: 'Declined',
    [InvitationStatus.pending]: 'Pending',
  },
  fr: {
    [InvitationStatus.accepted]: 'Accepté',
    [InvitationStatus.declined]: 'Refusé',
    [InvitationStatus.pending]: 'En attente',
  },
};

export interface CreateStructureInvitationRequestBody {
  professional_id: string;
  status?: InvitationStatus;
  structure_id: string;
}

export type StructureInvitation = Tables<'structure_invitations'>;

export interface StructureInvitationFilters {
  professional_id?: string;
  status?: InvitationStatus;
  structure_id?: string;
}

export type StructureInvitationInsert = TablesInsert<'structure_invitations'>;

export type StructureInvitationUpdate = TablesUpdate<'structure_invitations'>;
