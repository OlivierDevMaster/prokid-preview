import {
  Constants,
  type Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../../../../types/database/schema.ts';
import { createEnumConstants } from '../../utils/enums.ts';

export type ProfessionalSubscription = Tables<'subscriptions'>;
export type ProfessionalSubscriptionInsert = TablesInsert<'subscriptions'>;
export type ProfessionalSubscriptionUpdate = TablesUpdate<'subscriptions'>;

export type SubscriptionStatus = Enums<'subscription_status'>;

export const SubscriptionStatus = createEnumConstants(
  Constants.public.Enums.subscription_status
);

export const SubscriptionStatuses = Constants.public.Enums.subscription_status;

export const SubscriptionStatusLabel: Record<
  'en' | 'fr',
  Record<SubscriptionStatus, string>
> = {
  en: {
    [SubscriptionStatus.active]: 'Active',
    [SubscriptionStatus.canceled]: 'Canceled',
    [SubscriptionStatus.incomplete]: 'Incomplete',
    [SubscriptionStatus.incomplete_expired]: 'Incomplete Expired',
    [SubscriptionStatus.past_due]: 'Past Due',
    [SubscriptionStatus.paused]: 'Paused',
    [SubscriptionStatus.trialing]: 'Trialing',
    [SubscriptionStatus.unpaid]: 'Unpaid',
  },
  fr: {
    [SubscriptionStatus.active]: 'Actif',
    [SubscriptionStatus.canceled]: 'Annulé',
    [SubscriptionStatus.incomplete]: 'Incomplet',
    [SubscriptionStatus.incomplete_expired]: 'Incomplet Expiré',
    [SubscriptionStatus.past_due]: 'En Retard',
    [SubscriptionStatus.paused]: 'En Pause',
    [SubscriptionStatus.trialing]: 'Essai',
    [SubscriptionStatus.unpaid]: 'Impayé',
  },
};

export interface SubscriptionStatusResponse {
  isSubscribed: boolean;
  status: null | SubscriptionStatus;
  subscription: null | ProfessionalSubscription;
}
