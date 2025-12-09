import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database/schema';

export interface CreateNewsletterSubscriptionRequestBody {
  email: string;
  name?: null | string;
}

export type NewsletterSubscription = Tables<'newsletter_subscriptions'>;

export interface NewsletterSubscriptionFilters {
  emailSearch?: string;
  nameSearch?: string;
}

export type NewsletterSubscriptionInsert =
  TablesInsert<'newsletter_subscriptions'>;

export type NewsletterSubscriptionUpdate =
  TablesUpdate<'newsletter_subscriptions'>;
