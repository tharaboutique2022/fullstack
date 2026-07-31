import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '@/api/coupons';

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: string }) =>
      couponsApi.validate(code, subtotal),
  });
}
