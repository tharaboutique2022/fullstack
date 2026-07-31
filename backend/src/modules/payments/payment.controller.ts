import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getRouteParam } from '../../utils/routeParams';
import { getValidatedBody } from '../../utils/validatedRequest';
import { env } from '../../config/env';
import * as paymentService from './payment.service';
import type { VerifyPaymentInput } from './payment.validation';

function readRazorpayCallbackPayload(req: Request, orderId: string): VerifyPaymentInput {
  const source = { ...(req.body as Record<string, string>), ...(req.query as Record<string, string>) };
  return {
    orderId,
    razorpayOrderId: source.razorpay_order_id,
    razorpayPaymentId: source.razorpay_payment_id,
    razorpaySignature: source.razorpay_signature,
  };
}

function renderCompletePage(status: 'success' | 'failure', orderId: string): string {
  const title = status === 'success' ? 'Payment successful' : 'Payment failed';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 32px 20px; background: #faf7f5; color: #1f2937; text-align: center; }
    h1 { font-size: 22px; }
    p { color: #4b5563; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>Return to the app to view your order.</p>
</body>
</html>`;
}

export const initiateOrderPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.initiateOrderPayment(
    req.user!.id,
    getRouteParam(req.params.id)
  );
  sendSuccess(res, payment, 'Payment initiated successfully');
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const body = getValidatedBody<VerifyPaymentInput>(req);
  if (body.bookingId) {
    const booking = await paymentService.verifyBookingPayment(req.user!.id, {
      bookingId: body.bookingId,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      razorpaySignature: body.razorpaySignature,
    });
    sendSuccess(res, booking, 'Payment verified successfully');
    return;
  }

  const order = await paymentService.verifyOrderPayment(req.user!.id, {
    orderId: body.orderId!,
    razorpayOrderId: body.razorpayOrderId,
    razorpayPaymentId: body.razorpayPaymentId,
    razorpaySignature: body.razorpaySignature,
  });
  sendSuccess(res, order, 'Payment verified successfully');
});

export const initiateBookingPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.initiateBookingPayment(
    req.user!.id,
    getRouteParam(req.params.id)
  );
  sendSuccess(res, payment, 'Payment initiated successfully');
});

export const syncBookingPayment = asyncHandler(async (req: Request, res: Response) => {
  const booking = await paymentService.syncBookingPayment(req.user!.id, getRouteParam(req.params.id));
  sendSuccess(res, booking, 'Booking payment synced successfully');
});

export const syncOrderPayment = asyncHandler(async (req: Request, res: Response) => {
  const order = await paymentService.syncOrderPayment(req.user!.id, getRouteParam(req.params.id));
  sendSuccess(res, order, 'Order payment synced successfully');
});

export const getOrderPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await paymentService.getOrderPaymentStatus(
    req.user!.id,
    getRouteParam(req.params.id)
  );
  sendSuccess(res, order, 'Order payment status fetched successfully');
});

export const razorpayCallback = asyncHandler(async (req: Request, res: Response) => {
  const orderId = typeof req.query.orderId === 'string' ? req.query.orderId : '';
  const publicBase = env.appPublicUrl.replace(/\/$/, '');

  try {
    await paymentService.handleRazorpayCallback(orderId, readRazorpayCallbackPayload(req, orderId));
    res.redirect(
      302,
      `${publicBase}/api/payments/razorpay/complete?status=success&orderId=${encodeURIComponent(orderId)}`
    );
  } catch {
    res.redirect(
      302,
      `${publicBase}/api/payments/razorpay/complete?status=failure&orderId=${encodeURIComponent(orderId)}`
    );
  }
});

export const razorpayComplete = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status === 'success' ? 'success' : 'failure';
  const orderId = typeof req.query.orderId === 'string' ? req.query.orderId : '';
  res.status(200).send(renderCompletePage(status, orderId));
});
