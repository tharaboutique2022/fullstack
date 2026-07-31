import type {
  CreateProductReviewInput,
  CreateServiceReviewInput,
  Review,
} from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const reviewsApi = {
  listProductReviews: (productId: string) =>
    request<Review[]>(`/api/reviews/products/${productId}`),
  createProductReview: (input: CreateProductReviewInput) =>
    request<Review>('/api/reviews/products', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  createServiceReview: (input: CreateServiceReviewInput) =>
    request<Review>('/api/reviews/services', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
