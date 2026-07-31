import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Booking, PaymentInitResponse, VerifyPaymentInput } from '@ecomm/shared/api.types';
import { paymentsApi } from '@/api/payments';
import { bookingKeys } from '@/hooks/useBookings';
import { orderKeys } from '@/lib/queryKeys';

function invalidatePaymentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  entityType: PaymentInitResponse['entityType'],
  entityId: string
) {
  if (entityType === 'booking') {
    queryClient.invalidateQueries({ queryKey: bookingKeys.detail(entityId) });
    queryClient.invalidateQueries({ queryKey: bookingKeys.list });
    return;
  }

  queryClient.invalidateQueries({ queryKey: orderKeys.detail(entityId) });
  queryClient.invalidateQueries({ queryKey: orderKeys.list });
}

export function useInitiateOrderPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => paymentsApi.initiateOrder(orderId),
    onSuccess: (_data, orderId) => {
      invalidatePaymentQueries(queryClient, 'order', orderId);
    },
  });
}

export function useInitiateBookingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => paymentsApi.initiateBooking(bookingId),
    onSuccess: (_data, bookingId) => {
      invalidatePaymentQueries(queryClient, 'booking', bookingId);
    },
  });
}

/** @deprecated Use useInitiateOrderPayment */
export function useInitiatePayment() {
  return useInitiateOrderPayment();
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VerifyPaymentInput) => paymentsApi.verify(input),
    onSuccess: (data) => {
      if ('orderNumber' in data) {
        invalidatePaymentQueries(queryClient, 'order', (data as { id: string }).id);
        return;
      }
      invalidatePaymentQueries(queryClient, 'booking', (data as Booking).id);
    },
  });
}

export function useSyncOrderPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => paymentsApi.syncOrder(orderId),
    onSuccess: (data) => {
      invalidatePaymentQueries(queryClient, 'order', data.id);
    },
  });
}

export function useSyncBookingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => paymentsApi.syncBooking(bookingId),
    onSuccess: (data) => {
      invalidatePaymentQueries(queryClient, 'booking', data.id);
    },
  });
}

/** @deprecated Use useSyncOrderPayment */
export function useSyncPayment() {
  return useSyncOrderPayment();
}

export function useSyncPaymentForEntity(entityType: PaymentInitResponse['entityType']) {
  const syncOrder = useSyncOrderPayment();
  const syncBooking = useSyncBookingPayment();
  return entityType === 'booking' ? syncBooking : syncOrder;
}

export function useInitiatePaymentForEntity(entityType: PaymentInitResponse['entityType']) {
  const initiateOrder = useInitiateOrderPayment();
  const initiateBooking = useInitiateBookingPayment();
  return entityType === 'booking' ? initiateBooking : initiateOrder;
}
