import { z } from 'zod';
import { indianMobileSchema, optionalIndianMobileSchema } from '../../utils/phone.validation';

export const createBookingSchema = z.object({
  providerId: z.string().uuid(),
  packageId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bookingTime: z.string().trim().min(3),
  contactPhone: indianMobileSchema,
  alternatePhone: optionalIndianMobileSchema,
  notes: z.string().trim().optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().trim().min(5, 'Please provide a cancellation reason (at least 5 characters)'),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
});

export const listAdminBookingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
});

export const rescheduleBookingSchema = z.object({
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bookingTime: z.string().trim().min(3),
});

export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type ListAdminBookingsQuery = z.infer<typeof listAdminBookingsQuerySchema>;

export const updateBookingPaymentSchema = z.object({
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
  totalAmount: z.coerce.number().positive().optional(),
  notes: z.string().trim().optional().nullable(),
});

export type UpdateBookingPaymentInput = z.infer<typeof updateBookingPaymentSchema>;
