import { z } from 'zod';

import { Role } from './role.model';

export const RoleSchema = z.enum(Role);
