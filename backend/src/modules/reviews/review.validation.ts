import { z } from 'zod';

const reviewBodySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const createProductReviewSchema = reviewBodySchema.extend({
  productId: z.string().uuid(),
  orderId: z.string().uuid(),
});

export const createServiceReviewSchema = reviewBodySchema.extend({
  providerId: z.string().uuid(),
  bookingId: z.string().uuid(),
});
