import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users';

export const usersKeys = {
  customers: (params?: { page?: number; search?: string }) =>
    ['adminCustomers', params] as const,
};

export function useAdminCustomers(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: usersKeys.customers(params),
    queryFn: () => usersApi.list({ ...params, limit: 20 }),
  });
}
