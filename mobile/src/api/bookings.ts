import type {
  Booking,
  CreateBookingInput,
  RescheduleBookingInput,
} from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const bookingsApi = {
  list: () => request<Booking[]>('/api/bookings'),
  create: (input: CreateBookingInput) =>
    request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  get: (id: string) => request<Booking>(`/api/bookings/${id}`),
  cancel: (id: string, reason: string) =>
    request<Booking>(`/api/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  reschedule: (id: string, input: RescheduleBookingInput) =>
    request<Booking>(`/api/bookings/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
