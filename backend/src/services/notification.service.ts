import type { NotificationType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { sendBookingUpdateEmail, sendOrderUpdateEmail } from './email.service';

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
}) {
  return prisma.notification.create({
    data: input,
  });
}

export async function notifyOrderUpdate(
  userId: string,
  email: string,
  orderNumber: string,
  title: string,
  body: string,
  orderId: string
) {
  await createNotification({
    userId,
    type: 'order',
    title,
    body,
    entityType: 'order',
    entityId: orderId,
  });

  void sendOrderUpdateEmail(email, orderNumber, body);
}

export async function notifyBookingUpdate(
  userId: string,
  email: string,
  bookingNumber: string,
  title: string,
  body: string,
  bookingId: string
) {
  await createNotification({
    userId,
    type: 'booking',
    title,
    body,
    entityType: 'booking',
    entityId: bookingId,
  });

  void sendBookingUpdateEmail(email, bookingNumber, body);
}

export async function notifyPaymentSuccess(
  userId: string,
  title: string,
  body: string,
  entityType: 'order' | 'booking',
  entityId: string
) {
  await createNotification({
    userId,
    type: 'payment',
    title,
    body,
    entityType,
    entityId,
  });
}
