import {
  addDaysToDateOnly,
  formatInstantInTimeZone,
  todayDateOnly,
} from '@ecomm/shared';
import type { Booking, BookingStatus, Order, OrderStatus, PaymentMethod, PaymentStatus } from '@ecomm/shared/api.types';

export const ORDER_PLATFORM_FEE = 7;
export const ORDER_STANDARD_SHIPPING = 44;

export function formatInrAmount(value: string | number): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatOrderDate(isoDate: string): string {
  return formatInstantInTimeZone(isoDate, {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
}

export function getOrderStatusLabel(status: OrderStatus, createdAt: string): string {
  if (status === 'delivered') {
    return `Delivered on ${formatOrderDate(createdAt)}`;
  }
  if (status === 'confirmed' || status === 'processing') {
    return `Ordered on ${formatOrderDate(createdAt)}`;
  }
  if (status === 'cancelled') {
    return 'Cancelled';
  }
  return 'Pending';
}

export function getDeliveryEstimate(): string {
  const deliveryDate = addDaysToDateOnly(todayDateOnly(), 5);
  const [year, month, day] = deliveryDate.split('-').map(Number);
  const anchor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const label = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(anchor);
  return `Delivery by ${label}`;
}

export function getOrderPrimaryItem(order: Order) {
  return order.items[0] ?? null;
}

export function getOrderTitle(order: Order): string {
  const item = getOrderPrimaryItem(order);
  if (!item) return 'Order';
  const suffix = order.items.length > 1 ? ` +${order.items.length - 1} more` : '';
  return `${item.productName}${suffix}`;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  if (method === 'cod') return 'Cash on Delivery';
  return 'Online payment (Razorpay)';
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  if (status === 'paid') return 'Paid';
  if (status === 'failed') return 'Payment failed';
  if (status === 'refunded') return 'Refunded';
  return 'Payment pending';
}

export function canRetryPayment(order: Order): boolean {
  return (
    order.paymentMethod === 'online' &&
    order.paymentStatus !== 'paid' &&
    order.status !== 'cancelled' &&
    order.status !== 'delivered'
  );
}

export function canCancelOrder(order: Order): boolean {
  return order.status === 'pending' || order.status === 'confirmed';
}

export interface OrderStatusStep {
  key: OrderStatus;
  label: string;
  done: boolean;
  active: boolean;
}

const ORDER_FLOW: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export function getOrderStatusSteps(status: OrderStatus, paymentStatus?: PaymentStatus): OrderStatusStep[] {
  if (status === 'cancelled') {
    return [{ key: 'cancelled', label: 'Cancelled', done: true, active: true }];
  }

  const labels: Record<OrderStatus, string> = {
    pending: paymentStatus === 'paid' ? 'Paid' : 'Payment pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const currentIndex = ORDER_FLOW.indexOf(status);
  return ORDER_FLOW.map((step, index) => ({
    key: step,
    label: labels[step],
    done: currentIndex >= 0 && index <= currentIndex,
    active: index === currentIndex,
  }));
}
