import { AppError } from '../../errors/AppError';
import { dateOnlyToUtcDate, isDateOnlyString, todayDateOnly, toDateOnlyString } from '@ecomm/shared';
import { prisma } from '../../config/prisma';
import type {
  CancelBookingInput,
  CreateBookingInput,
  ListAdminBookingsQuery,
  UpdateBookingPaymentInput,
  UpdateBookingStatusInput,
} from './booking.validation';
import { serializeBooking } from './booking.serializer';
import { generateBookingNumber } from '../../utils/bookingNumber';
import { notifyBookingUpdate } from '../../services/notification.service';

const bookingAdminInclude = {
  provider: true,
  package: true,
  user: {
    select: { id: true, name: true, email: true, phone: true },
  },
} as const;

const bookingInclude = {
  provider: true,
  package: true,
} as const;

export { bookingInclude };

export async function listBookings(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: bookingInclude,
    orderBy: { createdAt: 'desc' },
  });

  return bookings.map((booking) => serializeBooking(booking));
}

export async function createBooking(userId: string, input: CreateBookingInput) {
  if (!isDateOnlyString(input.bookingDate)) {
    throw AppError.badRequest('Invalid booking date');
  }

  const bookingDate = dateOnlyToUtcDate(input.bookingDate);

  const provider = await prisma.serviceProvider.findFirst({
    where: { id: input.providerId, isActive: true },
    include: {
      timeSlots: { where: { isActive: true, slotTime: input.bookingTime } },
    },
  });

  if (!provider) {
    throw AppError.notFound('Service provider not found');
  }

  if (!provider.timeSlots.length) {
    throw AppError.badRequest('Selected time slot is not available');
  }

  const pkg = await prisma.servicePackage.findFirst({
    where: {
      id: input.packageId,
      providerId: input.providerId,
      isActive: true,
    },
  });

  if (!pkg) {
    throw AppError.notFound('Service package not found');
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      providerId: input.providerId,
      bookingDate,
      bookingTime: input.bookingTime,
      status: { not: 'cancelled' },
    },
  });

  if (conflict) {
    throw AppError.conflict('This time slot is already booked');
  }

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        userId,
        bookingNumber: generateBookingNumber(),
        providerId: input.providerId,
        packageId: input.packageId,
        bookingDate,
        bookingTime: input.bookingTime,
        totalAmount: pkg.priceMin,
        contactPhone: input.contactPhone,
        alternatePhone: input.alternatePhone ?? null,
        notes: input.notes ?? null,
      },
      include: bookingInclude,
    });

    const user = await tx.user.findUnique({ where: { id: userId }, select: { phone: true } });
    if (user && !user.phone) {
      await tx.user.update({
        where: { id: userId },
        data: { phone: input.contactPhone },
      });
    }

    return created;
  });

  return serializeBooking(booking);
}

export async function listAdminBookings(query: ListAdminBookingsQuery) {
  const { page, limit, status } = query;
  const where = status ? { status } : {};

  const [rows, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: bookingAdminInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: rows.map((row) => serializeBooking(row, { includeUser: true })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getAdminBookingById(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: bookingAdminInclude,
  });

  if (!booking) {
    throw AppError.notFound('Booking not found');
  }

  return serializeBooking(booking, { includeUser: true });
}

export async function updateBookingStatus(bookingId: string, input: UpdateBookingStatusInput) {
  const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!existing) {
    throw AppError.notFound('Booking not found');
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: input.status },
    include: bookingAdminInclude,
  });

  return serializeBooking(booking, { includeUser: true });
}

export async function updateBookingPayment(bookingId: string, input: UpdateBookingPaymentInput) {
  const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!existing) {
    throw AppError.notFound('Booking not found');
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: input.paymentStatus,
      ...(input.totalAmount !== undefined ? { totalAmount: input.totalAmount } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.paymentStatus === 'paid'
        ? { paidAt: existing.paidAt ?? new Date() }
        : input.paymentStatus === 'pending'
          ? { paidAt: null, paymentRef: null }
          : {}),
      ...(input.paymentStatus === 'paid' && existing.status === 'pending'
        ? { status: 'confirmed' }
        : {}),
    },
    include: bookingAdminInclude,
  });

  return serializeBooking(booking, { includeUser: true });
}

export async function getBookingById(userId: string, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: bookingInclude,
  });

  if (!booking) {
    throw AppError.notFound('Booking not found');
  }

  return serializeBooking(booking);
}

const USER_CANCELLABLE_BOOKING_STATUSES = new Set(['pending', 'confirmed']);

function bookingDateToDateOnly(date: Date): string {
  return toDateOnlyString({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

export async function cancelBookingByUser(
  userId: string,
  bookingId: string,
  input: CancelBookingInput
) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) {
    throw AppError.notFound('Booking not found');
  }

  if (!USER_CANCELLABLE_BOOKING_STATUSES.has(booking.status)) {
    throw AppError.badRequest('This booking can no longer be cancelled');
  }

  const appointmentDate = bookingDateToDateOnly(booking.bookingDate);
  if (appointmentDate <= todayDateOnly()) {
    throw AppError.badRequest('Bookings on or before today cannot be cancelled from the app');
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'cancelled',
      cancelReason: input.reason,
    },
    include: bookingInclude,
  });

  return serializeBooking(updated);
}

export async function rescheduleBookingByUser(
  userId: string,
  bookingId: string,
  input: { bookingDate: string; bookingTime: string }
) {
  if (!isDateOnlyString(input.bookingDate)) {
    throw AppError.badRequest('Invalid booking date');
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { user: { select: { email: true } } },
  });

  if (!booking) {
    throw AppError.notFound('Booking not found');
  }

  if (!USER_CANCELLABLE_BOOKING_STATUSES.has(booking.status)) {
    throw AppError.badRequest('This booking can no longer be rescheduled');
  }

  const bookingDate = dateOnlyToUtcDate(input.bookingDate);

  const conflict = await prisma.booking.findFirst({
    where: {
      providerId: booking.providerId,
      bookingDate,
      bookingTime: input.bookingTime,
      status: { not: 'cancelled' },
      NOT: { id: bookingId },
    },
  });

  if (conflict) {
    throw AppError.conflict('This time slot is already booked');
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      bookingDate,
      bookingTime: input.bookingTime,
    },
    include: bookingInclude,
  });

  void notifyBookingUpdate(
    userId,
    booking.user.email,
    booking.bookingNumber,
    `Booking ${booking.bookingNumber} rescheduled`,
    `Your booking was rescheduled to ${input.bookingDate} at ${input.bookingTime}.`,
    booking.id
  );

  return serializeBooking(updated);
}
