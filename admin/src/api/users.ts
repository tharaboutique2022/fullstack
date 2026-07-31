import type { CustomerSummary, PaginatedResult } from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

function buildQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const usersApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    request<PaginatedResult<CustomerSummary>>(`/api/admin/users${buildQuery(params)}`),
};
