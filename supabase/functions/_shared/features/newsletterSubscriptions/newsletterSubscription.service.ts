import { type SupabaseClient } from '@supabase/supabase-js';

import type {
  NewsletterSubscription,
  NewsletterSubscriptionInsert,
} from './newsletterSubscription.model.ts';

import { Database } from '../../../../../types/database/schema.ts';

export const createNewsletterSubscription = async (
  supabase: SupabaseClient<Database>,
  insertData: NewsletterSubscriptionInsert
): Promise<NewsletterSubscription> => {
  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .insert(insertData)
    .select('*')
    .single();

  if (error) throw error;

  return data;
};
