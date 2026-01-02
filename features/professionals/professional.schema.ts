import { z } from 'zod';

import { ProfessionalColumns } from './professional.model';

export const ProfessionalColumnSchema = z.enum(ProfessionalColumns);
