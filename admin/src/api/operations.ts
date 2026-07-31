import type {
  Booking,
  BookingStatus,
  Order,
  OrderStatus,
  PaginatedResult,
  UpdateBookingPaymentInput,
  UpdateBookingStatusInput,
  UpdateOrderStatusInput,
} from '@ecomm/shared/api.types';
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

export const ordersApi = {
  list: (params?: { page?: number; limit?: number; status?: OrderStatus }) =>
    request<PaginatedResult<Order>>(`/api/admin/orders${buildQuery(params)}`),
  get: (id: string) => request<Order>(`/api/admin/orders/${id}`),
  updateStatus: (id: string, body: UpdateOrderStatusInput) =>
    request<Order>(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export const bookingsApi = {
  list: (params?: { page?: number; limit?: number; status?: BookingStatus }) =>
    request<PaginatedResult<Booking>>(`/api/admin/bookings${buildQuery(params)}`),
  get: (id: string) => request<Booking>(`/api/admin/bookings/${id}`),
  updateStatus: (id: string, body: UpdateBookingStatusInput) =>
    request<Booking>(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  updatePayment: (id: string, body: UpdateBookingPaymentInput) =>
    request<Booking>(`/api/admin/bookings/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};
