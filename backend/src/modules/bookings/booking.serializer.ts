import type { Booking, BookingProviderSummary, BookingPackageSummary } from '@ecomm/shared';
import { toDateOnlyString } from '@ecomm/shared';

type BookingRow = {
  id: string;
  userId: string;
  bookingNumber: string;
  providerId: string;
  packageId: string;
  bookingDate: Date;
  bookingTime: string;
  totalAmount: { toString(): string };
  paymentMethod: Booking['paymentMethod'];
  paymentStatus: Booking['paymentStatus'];
  paymentTxnId: string | null;
  paymentRef: string | null;
  paidAt: Date | null;
  status: Booking['status'];
  contactPhone: string | null;
  alternatePhone: string | null;
  cancelReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  provider?: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    location: string | null;
  };
  package?: {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
};

function serializeProviderSummary(
  provider: NonNullable<BookingRow['provider']>
): BookingProviderSummary {
  return {
    id: provider.id,
    name: provider.name,
    slug: provider.slug,
    imageUrl: provider.imageUrl,
    location: provider.location,
  };
}

function serializePackageSummary(pkg: NonNullable<BookingRow['package']>): BookingPackageSummary {
  return {
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    durationMinutes: pkg.durationMinutes,
  };
}

export function serializeBooking(
  booking: BookingRow,
  options: { includeUser?: boolean } = {}
): Booking {
  return {
    id: booking.id,
    userId: booking.userId,
    bookingNumber: booking.bookingNumber,
    providerId: booking.providerId,
    packageId: booking.packageId,
    bookingDate: toDateOnlyString({
      year: booking.bookingDate.getUTCFullYear(),
      month: booking.bookingDate.getUTCMonth() + 1,
      day: booking.bookingDate.getUTCDate(),
    }),
    bookingTime: booking.bookingTime,
    totalAmount: booking.totalAmount.toString(),
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    paymentTxnId: booking.paymentTxnId,
    paymentRef: booking.paymentRef,
    paidAt: booking.paidAt?.toISOString() ?? null,
    status: booking.status,
    contactPhone: booking.contactPhone,
    alternatePhone: booking.alternatePhone,
    cancelReason: booking.cancelReason,
    notes: booking.notes,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    ...(booking.provider ? { provider: serializeProviderSummary(booking.provider) } : {}),
    ...(booking.package ? { package: serializePackageSummary(booking.package) } : {}),
    ...(options.includeUser && booking.user
      ? {
          user: {
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email,
            phone: booking.user.phone,
          },
        }
      : {}),
  };
}
