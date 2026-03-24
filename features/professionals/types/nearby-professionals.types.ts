import { Professional } from '@/features/professionals/professional.model';

export type NearbyProfessionalRpcRow = {
  city: null | string;
  distance_km: number;
  hourly_rate: null | number;
  is_available: boolean;
  is_default_case: boolean;
  user_id: string;
};

export type ProfessionalWithDistance = {
  distance_km: number;
  is_default_case: boolean;
} & Professional;
