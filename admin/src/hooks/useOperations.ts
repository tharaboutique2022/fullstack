import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BookingStatus, OrderStatus, UpdateBookingPaymentInput } from '@ecomm/shared/api.types';
import { bookingsApi, ordersApi } from '@/api/operations';

export const operationsKeys = {
  orders: (params?: { page?: number; status?: OrderStatus }) => ['adminOrders', params] as const,
  order: (id: string) => ['adminOrder', id] as const,
  bookings: (params?: { page?: number; status?: BookingStatus }) =>
    ['adminBookings', params] as const,
  booking: (id: string) => ['adminBooking', id] as const,
};

export function useAdminOrders(params?: { page?: number; status?: OrderStatus }) {
  return useQuery({
    queryKey: operationsKeys.orders(params),
    queryFn: () => ordersApi.list({ ...params, limit: 20 }),
  });
}

export function useAdminOrder(id: string, enabled = true) {
  return useQuery({
    queryKey: operationsKeys.order(id),
    queryFn: () => ordersApi.get(id),
    enabled: enabled && !!id,
  });
}

export function useOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: operationsKeys.order(variables.id) });
    },
  });
}

export function useAdminBookings(params?: { page?: number; status?: BookingStatus }) {
  return useQuery({
    queryKey: operationsKeys.bookings(params),
    queryFn: () => bookingsApi.list({ ...params, limit: 20 }),
  });
}

export function useAdminBooking(id: string, enabled = true) {
  return useQuery({
    queryKey: operationsKeys.booking(id),
    queryFn: () => bookingsApi.get(id),
    enabled: enabled && !!id,
  });
}

export function useBookingStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingsApi.updateStatus(id, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: operationsKeys.booking(variables.id) });
    },
  });
}

export function useBookingPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateBookingPaymentInput & { id: string }) =>
      bookingsApi.updatePayment(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: operationsKeys.booking(variables.id) });
    },
  });
}
