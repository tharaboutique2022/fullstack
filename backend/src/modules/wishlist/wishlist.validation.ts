import { z } from 'zod';

export const wishlistProductSchema = z.object({
  productId: z.string().uuid(),
});
