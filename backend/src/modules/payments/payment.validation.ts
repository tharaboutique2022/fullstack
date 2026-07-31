import { z } from 'zod';

export const verifyPaymentSchema = z
  .object({
    orderId: z.string().uuid().optional(),
    bookingId: z.string().uuid().optional(),
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  })
  .refine((data) => data.orderId || data.bookingId, {
    message: 'orderId or bookingId is required',
  });

export const verifyBookingPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
