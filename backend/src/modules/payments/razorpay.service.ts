import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/env';
import { assertRazorpayConfigured } from './razorpay.config';

let client: Razorpay | null = null;

function getClient(): Razorpay {
  assertRazorpayConfigured();
  if (!client) {
    client = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    });
  }
  return client;
}

export async function createRazorpayOrder(input: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const razorpay = getClient();
  return razorpay.orders.create({
    amount: input.amountPaise,
    currency: 'INR',
    receipt: input.receipt.slice(0, 40),
    notes: input.notes,
  });
}

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  assertRazorpayConfigured();
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac('sha256', env.razorpay.keySecret).update(body).digest('hex');
  return expected === razorpaySignature;
}

export async function fetchRazorpayPayment(razorpayPaymentId: string) {
  const razorpay = getClient();
  return razorpay.payments.fetch(razorpayPaymentId);
}

export async function fetchRazorpayOrderPayments(razorpayOrderId: string) {
  const razorpay = getClient();
  return razorpay.orders.fetchPayments(razorpayOrderId);
}

export async function createRazorpayRefund(paymentId: string, amountInr: number) {
  const razorpay = getClient();
  return razorpay.payments.refund(paymentId, {
    amount: Math.round(amountInr * 100),
  });
}

export function formatRazorpayError(error: unknown): string {
  if (error && typeof error === 'object') {
    const razorpayError = error as {
      error?: { description?: string; reason?: string };
      description?: string;
      message?: string;
    };

    const description = razorpayError.error?.description ?? razorpayError.description;
    if (description) {
      if (description.toLowerCase().includes('authentication failed')) {
        return 'Razorpay authentication failed. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env (use Test Mode keys from dashboard.razorpay.com → Settings → API Keys).';
      }
      return description;
    }

    if (razorpayError.message) {
      return razorpayError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Payment initiation failed';
}
