import { env } from '../../config/env';

export function assertRazorpayConfigured(): void {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new Error(
      'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env'
    );
  }
}
