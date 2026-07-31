import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';

function serializeReview(review: {
  id: string;
  userId: string;
  targetType: string;
  productId: string | null;
  providerId: string | null;
  orderId: string | null;
  bookingId: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user?: { name: string };
}) {
  return {
    id: review.id,
    userId: review.userId,
    targetType: review.targetType,
    productId: review.productId,
    providerId: review.providerId,
    orderId: review.orderId,
    bookingId: review.bookingId,
    rating: review.rating,
    comment: review.comment,
    authorName: review.user?.name ?? 'Customer',
    createdAt: review.createdAt.toISOString(),
  };
}

async function refreshProviderRating(providerId: string) {
  const stats = await prisma.review.aggregate({
    where: { providerId, targetType: 'service' },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.serviceProvider.update({
    where: { id: providerId },
    data: {
      rating: stats._avg.rating ?? null,
      reviewCount: stats._count.rating,
    },
  });
}

export async function createProductReview(
  userId: string,
  input: { productId: string; orderId: string; rating: number; comment?: string }
) {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      orderId: input.orderId,
      productId: input.productId,
      order: { userId, paymentStatus: 'paid' },
    },
  });

  if (!orderItem) {
    throw AppError.badRequest('You can only review products from your paid orders');
  }

  const review = await prisma.review.create({
    data: {
      userId,
      targetType: 'product',
      productId: input.productId,
      orderId: input.orderId,
      rating: input.rating,
      comment: input.comment ?? null,
    },
    include: { user: { select: { name: true } } },
  });

  return serializeReview(review);
}

export async function createServiceReview(
  userId: string,
  input: { providerId: string; bookingId: string; rating: number; comment?: string }
) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: input.bookingId,
      userId,
      providerId: input.providerId,
      status: { in: ['confirmed', 'completed'] },
    },
  });

  if (!booking) {
    throw AppError.badRequest('You can only review completed or confirmed bookings');
  }

  const review = await prisma.review.create({
    data: {
      userId,
      targetType: 'service',
      providerId: input.providerId,
      bookingId: input.bookingId,
      rating: input.rating,
      comment: input.comment ?? null,
    },
    include: { user: { select: { name: true } } },
  });

  await refreshProviderRating(input.providerId);
  return serializeReview(review);
}

export async function listProductReviews(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId, targetType: 'product' },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return reviews.map(serializeReview);
}

export async function listProviderReviews(providerId: string) {
  const reviews = await prisma.review.findMany({
    where: { providerId, targetType: 'service' },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return reviews.map(serializeReview);
}
