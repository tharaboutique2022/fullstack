import type { WishlistItem } from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const wishlistApi = {
  list: () => request<WishlistItem[]>('/api/wishlist'),
  add: (productId: string) =>
    request<WishlistItem>('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
  remove: (productId: string) =>
    request<null>(`/api/wishlist/${productId}`, { method: 'DELETE' }),
  status: (productId: string) =>
    request<{ wishlisted: boolean }>(`/api/wishlist/${productId}/status`),
};
