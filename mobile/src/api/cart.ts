import type { AddCartItemInput, Cart, MergeCartInput, UpdateCartItemInput } from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const cartApi = {
  getCart: () => request<Cart>('/api/cart'),
  addItem: (input: AddCartItemInput) =>
    request<Cart>('/api/cart/items', { method: 'POST', body: JSON.stringify(input) }),
  updateItem: (id: string, input: UpdateCartItemInput) =>
    request<Cart>(`/api/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  removeItem: (id: string) => request<Cart>(`/api/cart/items/${id}`, { method: 'DELETE' }),
  clearCart: () => request<Cart>('/api/cart', { method: 'DELETE' }),
  merge: (input: MergeCartInput) =>
    request<Cart>('/api/cart/merge', { method: 'POST', body: JSON.stringify(input) }),
};
