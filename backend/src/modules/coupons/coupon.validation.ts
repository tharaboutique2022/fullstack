import { z } from 'zod';

export const validateCouponSchema = z.object({
  code: z.string().trim().min(2),
  subtotal: z.coerce.number().nonnegative(),
});

export const createCouponSchema = z.object({
  code: z.string().trim().min(2),
  description: z.string().trim().optional().nullable(),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateCouponSchema = createCouponSchema.partial().omit({ code: true });

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
