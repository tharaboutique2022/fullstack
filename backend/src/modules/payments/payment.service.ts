import { normalizeIndianMobile } from '@ecomm/shared';
import { AppError } from '../../errors/AppError';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { orderInclude, serializeOrder } from '../orders/order.serializer';
import { bookingInclude } from '../bookings/booking.service';
import { serializeBooking } from '../bookings/booking.serializer';
import { notifyPaymentSuccess } from '../../services/notification.service';
import {
  createRazorpayOrder,
  fetchRazorpayOrderPayments,
  fetchRazorpayPayment,
  formatRazorpayError,
  verifyRazorpaySignature,
} from './razorpay.service';
import type { VerifyPaymentInput } from './payment.validation';

async function loadPayableOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (order.status === 'cancelled' || order.status === 'delivered') {
    throw AppError.badRequest('This order cannot be paid');
  }

  if (order.paymentStatus === 'paid') {
    throw AppError.badRequest('This order is already paid');
  }

  return order;
}

function toAmountPaise(amount: string | number | { toString(): string }): number {
  return Math.round(Number(amount.toString()) * 100);
}

export async function initiateOrderPayment(userId: string, orderId: string) {
  const order = await loadPayableOrder(userId, orderId);
  const phone = normalizeIndianMobile(order.contactPhone ?? order.user.phone ?? '');
  const firstName = order.user.name.trim().split(/\s+/)[0] || 'Customer';

  try {
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: toAmountPaise(order.totalAmount),
      receipt: order.orderNumber,
      notes: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentTxnId: razorpayOrder.id,
        paymentStatus: 'pending',
      },
    });

    const publicBase = env.appPublicUrl.replace(/\/$/, '');

    return {
      gateway: 'razorpay' as const,
      entityType: 'order' as const,
      entityId: order.id,
      keyId: env.razorpay.keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: Number(razorpayOrder.amount),
      currency: 'INR' as const,
      name: env.razorpay.merchantName,
      description: `Order ${order.orderNumber}`,
      callbackUrl: `${publicBase}/api/payments/razorpay/callback?orderId=${encodeURIComponent(order.id)}`,
      prefill: {
        name: order.user.name,
        email: order.user.email,
        contact: phone,
      },
    };
  } catch (error) {
    throw AppError.badRequest(formatRazorpayError(error));
  }
}

async function markOrderPaid(orderId: string, txnId: string, paymentRef: string | null) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return null;
  }

  if (order.paymentStatus === 'paid') {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'paid',
      paymentTxnId: txnId,
      paymentRef,
      paidAt: new Date(),
      status: order.status === 'pending' ? 'confirmed' : order.status,
    },
    include: { ...orderInclude, user: { select: { id: true, email: true } } },
  });
}

async function markOrderPaymentFailed(orderId: string, txnId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentStatus === 'paid') {
    return null;
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'failed',
      paymentTxnId: txnId,
    },
    include: orderInclude,
  });
}

export async function verifyOrderPayment(userId: string, input: VerifyPaymentInput) {
  const orderId = input.orderId;
  if (!orderId) {
    throw AppError.badRequest('orderId is required');
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (order.paymentStatus === 'paid') {
    return serializeOrder(order);
  }

  if (order.status === 'cancelled' || order.status === 'delivered') {
    throw AppError.badRequest('This order cannot be paid');
  }

  const signatureValid = verifyRazorpaySignature(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature
  );

  if (!signatureValid) {
    await markOrderPaymentFailed(orderId, input.razorpayOrderId);
    throw AppError.badRequest('Invalid payment signature');
  }

  const payment = await fetchRazorpayPayment(input.razorpayPaymentId);
  const expectedAmount = toAmountPaise(order.totalAmount);

  if (payment.order_id !== input.razorpayOrderId) {
    throw AppError.badRequest('Payment order mismatch');
  }

  if (Number(payment.amount) !== expectedAmount || payment.currency !== 'INR') {
    await markOrderPaymentFailed(orderId, input.razorpayOrderId);
    throw AppError.badRequest('Payment amount mismatch');
  }

  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    await markOrderPaymentFailed(orderId, input.razorpayOrderId);
    throw AppError.badRequest('Payment was not completed');
  }

  const updated = await markOrderPaid(
    orderId,
    input.razorpayOrderId,
    input.razorpayPaymentId
  );

  if (!updated) {
    throw AppError.notFound('Order not found');
  }

  return serializeOrder(updated);
}

export async function syncOrderPayment(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (order.paymentStatus === 'paid') {
    return serializeOrder(order);
  }

  if (!order.paymentTxnId) {
    throw AppError.badRequest('No payment session found for this order');
  }

  const paymentsResponse = await fetchRazorpayOrderPayments(order.paymentTxnId);
  const expectedAmount = toAmountPaise(order.totalAmount);
  const captured = (paymentsResponse.items ?? []).find(
    (payment) =>
      (payment.status === 'captured' || payment.status === 'authorized') &&
      Number(payment.amount) === expectedAmount &&
      payment.currency === 'INR'
  );

  if (!captured) {
    return serializeOrder(order);
  }

  const updated = await markOrderPaid(orderId, order.paymentTxnId, captured.id);
  if (!updated) {
    throw AppError.notFound('Order not found');
  }

  return serializeOrder(updated);
}

export async function handleRazorpayCallback(orderId: string, input: VerifyPaymentInput) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw AppError.notFound('Order not found');
  }

  return verifyOrderPayment(order.userId, input);
}

export async function getOrderPaymentStatus(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  return serializeOrder(order);
}

async function loadPayableBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      package: { select: { name: true } },
    },
  });

  if (!booking) {
    throw AppError.notFound('Booking not found');
  }

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    throw AppError.badRequest('This booking cannot be paid');
  }

  if (booking.paymentStatus === 'paid') {
    throw AppError.badRequest('This booking is already paid');
  }

  return booking;
}

async function markBookingPaid(bookingId: string, txnId: string, paymentRef: string | null) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return null;

  if (booking.paymentStatus === 'paid') {
    return prisma.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'paid',
      paymentTxnId: txnId,
      paymentRef,
      paidAt: new Date(),
      status: booking.status === 'pending' ? 'confirmed' : booking.status,
    },
    include: bookingInclude,
  });
}

export async function initiateBookingPayment(userId: string, bookingId: string) {
  const booking = await loadPayableBooking(userId, bookingId);
  const phone = normalizeIndianMobile(booking.contactPhone ?? booking.user.phone ?? '');

  try {
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: toAmountPaise(booking.totalAmount),
      receipt: booking.bookingNumber,
      notes: { bookingId: booking.id },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentTxnId: razorpayOrder.id, paymentStatus: 'pending' },
    });

    const publicBase = env.appPublicUrl.replace(/\/$/, '');

    return {
      gateway: 'razorpay' as const,
      entityType: 'booking' as const,
      entityId: booking.id,
      keyId: env.razorpay.keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: Number(razorpayOrder.amount),
      currency: 'INR' as const,
      name: env.razorpay.merchantName,
      description: `Booking ${booking.bookingNumber}`,
      callbackUrl: `${publicBase}/api/payments/razorpay/callback?bookingId=${encodeURIComponent(booking.id)}`,
      prefill: {
        name: booking.user.name,
        email: booking.user.email,
        contact: phone,
      },
    };
  } catch (error) {
    throw AppError.badRequest(formatRazorpayError(error));
  }
}

export async function verifyBookingPayment(
  userId: string,
  input: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }
) {
  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, userId },
    include: bookingInclude,
  });

  if (!booking) throw AppError.notFound('Booking not found');
  if (booking.paymentStatus === 'paid') return serializeBooking(booking);

  const signatureValid = verifyRazorpaySignature(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature
  );

  if (!signatureValid) {
    throw AppError.badRequest('Invalid payment signature');
  }

  const payment = await fetchRazorpayPayment(input.razorpayPaymentId);
  if (
    Number(payment.amount) !== toAmountPaise(booking.totalAmount) ||
    payment.currency !== 'INR' ||
    (payment.status !== 'captured' && payment.status !== 'authorized')
  ) {
    throw AppError.badRequest('Payment was not completed');
  }

  const updated = await markBookingPaid(input.bookingId, input.razorpayOrderId, input.razorpayPaymentId);
  if (!updated) throw AppError.notFound('Booking not found');

  void notifyPaymentSuccess(
    userId,
    'Booking payment received',
    `Payment for booking ${booking.bookingNumber} was successful.`,
    'booking',
    booking.id
  );

  return serializeBooking(updated);
}

export async function syncBookingPayment(userId: string, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: bookingInclude,
  });

  if (!booking) throw AppError.notFound('Booking not found');
  if (booking.paymentStatus === 'paid') return serializeBooking(booking);
  if (!booking.paymentTxnId) throw AppError.badRequest('No payment session found for this booking');

  const paymentsResponse = await fetchRazorpayOrderPayments(booking.paymentTxnId);
  const expectedAmount = toAmountPaise(booking.totalAmount);
  const captured = (paymentsResponse.items ?? []).find(
    (payment) =>
      (payment.status === 'captured' || payment.status === 'authorized') &&
      Number(payment.amount) === expectedAmount &&
      payment.currency === 'INR'
  );

  if (!captured) return serializeBooking(booking);

  const updated = await markBookingPaid(bookingId, booking.paymentTxnId, captured.id);
  if (!updated) throw AppError.notFound('Booking not found');
  return serializeBooking(updated);
}
