import { todayDateOnly } from '@ecomm/shared';
import type { Booking } from '@ecomm/shared/api.types';

export function formatBookingSchedule(bookingDate: string, bookingTime: string): string {
  const [year, month, day] = bookingDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const monthName = date.toLocaleDateString('en-IN', { month: 'long' });
  const dayPadded = String(day).padStart(2, '0');
  return `${monthName} ${dayPadded} ${year} - ${bookingTime}`;
}

export function getBookingTitle(providerName?: string): string {
  if (!providerName) return 'Booked service';
  if (/mehandi|mehendi/i.test(providerName)) return 'Service for Mehandi';
  if (/makeup/i.test(providerName)) return 'Service for Makeup';
  if (/gym|fitness|trainer/i.test(providerName)) return 'Gym Trainer';
  return providerName;
}

export function getPackageLabel(packageName?: string): string {
  if (!packageName) return 'Service package';
  return `${packageName} package`;
}

export function canCancelBooking(booking: Booking): boolean {
  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    return false;
  }
  return booking.bookingDate > todayDateOnly();
}

export function canRescheduleBooking(booking: Booking): boolean {
  return booking.status === 'pending' || booking.status === 'confirmed';
}

export function canRetryBookingPayment(booking: Booking): boolean {
  return (
    booking.paymentMethod === 'online' &&
    booking.paymentStatus !== 'paid' &&
    booking.status !== 'cancelled'
  );
}

export function getBookingStatusLabel(status: Booking['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
