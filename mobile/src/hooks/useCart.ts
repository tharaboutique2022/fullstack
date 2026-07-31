import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddCartItemInput } from '@ecomm/shared/api.types';
import { cartApi } from '@/api/cart';
import { cartKeys, orderKeys } from '@/lib/queryKeys';

export { cartKeys };

export function useCart(enabled = true) {
  return useQuery({
    queryKey: cartKeys.cart,
    queryFn: cartApi.getCart,
    enabled,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddCartItemInput) => cartApi.addItem(input),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.cart, cart);
      queryClient.invalidateQueries({ queryKey: ['orders', 'checkout-quote'] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      cartApi.updateItem(id, { quantity }),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.cart, cart);
      queryClient.invalidateQueries({ queryKey: ['orders', 'checkout-quote'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cartApi.removeItem(id),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.cart, cart);
      queryClient.invalidateQueries({ queryKey: ['orders', 'checkout-quote'] });
    },
  });
}
