import { z } from 'zod';
import { indianMobileSchema } from '../../utils/phone.validation';

export const createOrderSchema = z.object({
  notes: z.string().trim().optional(),
  shippingOption: z.enum(['standard']).optional(),
  addressId: z.string().uuid().optional(),
  contactPhone: indianMobileSchema,
  paymentMethod: z.literal('online'),
  couponCode: z.string().trim().optional(),
});

export const checkoutQuoteSchema = z.object({
  couponCode: z.string().trim().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(5, 'Please provide a cancellation reason (at least 5 characters)'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingId: z.string().trim().optional().nullable(),
});

export const listAdminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ListAdminOrdersQuery = z.infer<typeof listAdminOrdersQuerySchema>;
