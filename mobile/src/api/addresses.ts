import type { Address, AddressInput } from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const addressesApi = {
  list: () => request<Address[]>('/api/addresses'),
  default: () => request<Address | null>('/api/addresses/default'),
  create: (body: AddressInput) =>
    request<Address>('/api/addresses', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<AddressInput>) =>
    request<Address>(`/api/addresses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: string) => request<null>(`/api/addresses/${id}`, { method: 'DELETE' }),
};
