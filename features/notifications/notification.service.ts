import {
  PaginationOptions,
  PaginationResult,
} from '@/features/paginations/pagination.model';
import { createClient } from '@/lib/supabase/client';

import type { Notification, NotificationFilters } from './notification.model';

import { NotificationConfig } from './notification.config';

export const findNotifications = async (
  filters: NotificationFilters = {},
  paginationOptions: PaginationOptions = {}
): Promise<PaginationResult<Notification>> => {
  const supabase = createClient();

  let query = supabase.from('notifications').select('*', { count: 'exact' });

  if (filters.recipient_id) {
    query = query.eq('recipient_id', filters.recipient_id);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.read !== undefined) {
    if (filters.read) {
      query = query.not('read_at', 'is', null);
    } else {
      query = query.is('read_at', null);
    }
  }

  const page = paginationOptions.page ?? NotificationConfig.PAGE_DEFAULT;

  const limit = paginationOptions.limit ?? NotificationConfig.PAGE_SIZE_DEFAULT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('created_at', { ascending: false }).range(from, to);

  const { count, data, error } = await query;

  if (error) throw error;

  return {
    count: count ?? 0,
    data: (data ?? []) as unknown as Notification[],
  };
};

export const findNotification = async (
  notificationId: string
): Promise<Notification | null> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', notificationId)
    .maybeSingle();

  if (error) throw error;

  return data as Notification | null;
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<Notification> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select('*')
    .single();

  if (error) throw error;

  return data as unknown as Notification;
};

export const markAllNotificationsAsRead = async (
  recipientId: string
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', recipientId)
    .is('read_at', null);

  if (error) throw error;
};

export const getNotificationUnreadCount = async (
  recipientId: string
): Promise<number> => {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .is('read_at', null);

  if (error) throw error;

  return count ?? 0;
};
