import type { Enums } from '../../../../../types/database/schema';

import { Constants } from '../../../../../types/database/schema';
import { createEnumConstants } from '../../utils/enums';

export type Role = Enums<'role'>;

export const Role = createEnumConstants(Constants.public.Enums.role);

export const Roles = Constants.public.Enums.role;
