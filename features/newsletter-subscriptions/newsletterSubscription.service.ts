import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { createClient } from '@/lib/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

import type {
  CreateNewsletterSubscriptionRequestBody,
  NewsletterSubscription,
  NewsletterSubscriptionFilters,
} from './newsletterSubscription.model';

import { NewsletterSubscriptionConfig } from './newsletterSubscription.config';

export const createNewsletterSubscription = async (
  body: CreateNewsletterSubscriptionRequestBody
): Promise<NewsletterSubscription> => {
  const supabase = createClient();

  return invokeEdgeFunction<
    NewsletterSubscription,
    CreateNewsletterSubscriptionRequestBody
  >(supabase, 'newsletter-subscriptions', {
    body: body,
    method: 'POST',
  });
};

export const findNewsletterSubscription = async (
  subscriptionId: string
): Promise<NewsletterSubscription | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const findNewsletterSubscriptions = async (
  filters: NewsletterSubscriptionFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<NewsletterSubscription>> => {
  const supabase = createClient();

  let query = supabase
    .from('newsletter_subscriptions')
    .select('*', { count: 'exact' });

  if (filters.emailSearch) {
    query = query.ilike('email', `%${filters.emailSearch}%`);
  }

  if (filters.nameSearch) {
    query = query.ilike('name', `%${filters.nameSearch}%`);
  }

  const page =
    paginationOptions.page ?? NewsletterSubscriptionConfig.PAGE_DEFAULT;

  const limit =
    paginationOptions.limit ?? NewsletterSubscriptionConfig.PAGE_SIZE_DEFAULT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: data ?? [],
  };
};
