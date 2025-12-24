import type { Enums } from '@/types/database/schema';

import { createEnumConstants } from '@/lib/utils/enums';
import { Constants } from '@/types/database/schema';

export type Role = Enums<'role'>;

export const Role = createEnumConstants(Constants.public.Enums.role);

export const Roles = Constants.public.Enums.role;

export const RoleLabel: Record<'en' | 'fr', Record<Role, string>> = {
  en: {
    [Role.admin]: 'Administrator',
    [Role.professional]: 'Professional',
    [Role.structure]: 'Structure',
  },
  fr: {
    [Role.admin]: 'Administrateur',
    [Role.professional]: 'Professionnel',
    [Role.structure]: 'Structure',
  },
};
