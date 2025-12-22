/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck This file should not be checked
import type { Enums } from '../../../../../types/database/schema.ts';

import { Constants } from '../../../../../types/database/schema.ts';
import { createEnumConstants } from '../../utils/enums.ts';

export type Role = Enums<'role'>;

export const Role = createEnumConstants(Constants.public.Enums.role);

export const Roles = Constants.public.Enums.role;
