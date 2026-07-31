import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { couponsApi, type CreateCouponInput } from '@/api/coupons';

export const couponsKeys = {
  all: ['adminCoupons'] as const,
};

export function useAdminCoupons() {
  return useQuery({
    queryKey: couponsKeys.all,
    queryFn: couponsApi.list,
  });
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCouponInput) => couponsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponsKeys.all });
    },
  });
}
