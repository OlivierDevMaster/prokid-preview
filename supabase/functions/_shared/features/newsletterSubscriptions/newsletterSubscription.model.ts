import {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../../../../types/database/schema.ts';

export type NewsletterSubscription = Tables<'newsletter_subscriptions'>;
export type NewsletterSubscriptionInsert =
  TablesInsert<'newsletter_subscriptions'>;
export type NewsletterSubscriptionUpdate =
  TablesUpdate<'newsletter_subscriptions'>;
