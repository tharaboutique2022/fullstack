import type { CheckoutQuote, CreateOrderInput, CreateOrderResponse, Order } from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const ordersApi = {
  checkoutQuote: (couponCode?: string) => {
    const query = couponCode ? `?couponCode=${encodeURIComponent(couponCode)}` : '';
    return request<CheckoutQuote>(`/api/orders/checkout-quote${query}`);
  },
  list: () => request<Order[]>('/api/orders'),
  get: (id: string) => request<Order>(`/api/orders/${id}`),
  create: (input: CreateOrderInput) =>
    request<CreateOrderResponse>('/api/orders', { method: 'POST', body: JSON.stringify(input) }),
  cancel: (id: string, reason: string) =>
    request<Order>(`/api/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};
