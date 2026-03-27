import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { PaginationOptions } from '@/features/paginations/pagination.model';

import {
  AdminUsersFilters,
  getAdminUser,
  getAdminUsers,
} from '../users.service';

export const useAdminUsers = (
  filters: AdminUsersFilters = {},
  options: PaginationOptions = {}
) => {
  return useQuery({
    enabled: true,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return getAdminUsers(filters, options);
    },
    queryKey: ['admin', 'users', filters, options],
  });
};

export const useAdminUser = (userId: string) => {
  return useQuery({
    enabled: !!userId,
    queryFn: async () => {
      return getAdminUser(userId);
    },
    queryKey: ['admin', 'user', userId],
  });
};
