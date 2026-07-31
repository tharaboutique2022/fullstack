import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateBookingInput, RescheduleBookingInput } from '@ecomm/shared/api.types';
import { bookingsApi } from '@/api/bookings';

export const bookingKeys = {
  list: ['bookings'] as const,
  detail: (id: string) => ['bookings', id] as const,
};

export function useBookings(enabled = true) {
  return useQuery({
    queryKey: bookingKeys.list,
    queryFn: bookingsApi.list,
    enabled,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.list });
    },
  });
}

export function useBooking(id: string, enabled = true) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingsApi.get(id),
    enabled: enabled && !!id,
  });
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...input }: RescheduleBookingInput & { id: string }) =>
      bookingsApi.reschedule(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.list });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => bookingsApi.cancel(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.list });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
    },
  });
}
