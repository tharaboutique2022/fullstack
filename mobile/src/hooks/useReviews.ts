import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateProductReviewInput, CreateServiceReviewInput } from '@ecomm/shared/api.types';
import { reviewsApi } from '@/api/reviews';
import { reviewKeys } from '@/lib/queryKeys';

export { reviewKeys };

export function useProductReviews(productId: string, enabled = true) {
  return useQuery({
    queryKey: reviewKeys.product(productId),
    queryFn: () => reviewsApi.listProductReviews(productId),
    enabled: enabled && !!productId,
  });
}

export function useCreateProductReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductReviewInput) => reviewsApi.createProductReview(input),
    onSuccess: (review) => {
      if (review.productId) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.product(review.productId) });
      }
    },
  });
}

export function useCreateServiceReview() {
  return useMutation({
    mutationFn: (input: CreateServiceReviewInput) => reviewsApi.createServiceReview(input),
  });
}
