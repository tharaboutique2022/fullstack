import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateOrderInput } from '@ecomm/shared/api.types';
import { ordersApi } from '@/api/orders';
import { cartKeys, orderKeys } from '@/lib/queryKeys';

export { orderKeys };

export function useCheckoutQuote(couponCode?: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.checkoutQuote(couponCode),
    queryFn: () => ordersApi.checkoutQuote(couponCode),
    enabled,
  });
}

export function useOrders(enabled = true) {
  return useQuery({
    queryKey: orderKeys.list,
    queryFn: ordersApi.list,
    enabled,
  });
}

export function useOrder(id: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: enabled && !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.list });
      queryClient.removeQueries({ queryKey: ['orders', 'checkout-quote'] });
      queryClient.invalidateQueries({ queryKey: cartKeys.cart });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => ordersApi.cancel(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.list });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
    },
  });
}
