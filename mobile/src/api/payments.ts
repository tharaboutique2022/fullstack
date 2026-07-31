import type { Booking, Order, PaymentInitResponse, VerifyPaymentInput } from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const paymentsApi = {
  initiateOrder: (orderId: string) =>
    request<PaymentInitResponse>(`/api/payments/orders/${orderId}/initiate`, {
      method: 'POST',
    }),
  initiateBooking: (bookingId: string) =>
    request<PaymentInitResponse>(`/api/payments/bookings/${bookingId}/initiate`, {
      method: 'POST',
    }),
  verify: (input: VerifyPaymentInput) =>
    request<Order | Booking>('/api/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  syncOrder: (orderId: string) =>
    request<Order>(`/api/payments/orders/${orderId}/sync`, {
      method: 'POST',
    }),
  syncBooking: (bookingId: string) =>
    request<Booking>(`/api/payments/bookings/${bookingId}/sync`, {
      method: 'POST',
    }),
  /** @deprecated Use initiateOrder */
  initiate: (orderId: string) =>
    request<PaymentInitResponse>(`/api/payments/orders/${orderId}/initiate`, {
      method: 'POST',
    }),
  /** @deprecated Use syncOrder */
  sync: (orderId: string) =>
    request<Order>(`/api/payments/orders/${orderId}/sync`, {
      method: 'POST',
    }),
};
