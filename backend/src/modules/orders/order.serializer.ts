import type { Prisma } from '@prisma/client';
import {
  ORDER_PLATFORM_FEE,
  ORDER_STANDARD_SHIPPING,
  calculateOrderTotal,
} from './order.constants';

export const orderAdminInclude = {
  user: {
    select: { id: true, name: true, email: true, phone: true },
  },
  items: {
    include: {
      product: { select: { imageUrl: true } },
      variant: { select: { imageUrl: true } },
    },
  },
} satisfies Prisma.OrderInclude;

export const orderInclude = {
  items: {
    include: {
      product: { select: { imageUrl: true } },
      variant: { select: { imageUrl: true } },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;
type AdminOrderWithItems = Prisma.OrderGetPayload<{ include: typeof orderAdminInclude }>;

function serializeUserSummary(user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
}

function getItemImageUrl(item: OrderWithItems['items'][number]): string | null {
  return item.variant?.imageUrl ?? item.product.imageUrl;
}

function getSubtotal(items: OrderWithItems['items']): number {
  return items.reduce((sum, item) => sum + Number(item.priceAtOrder) * item.quantity, 0);
}

export function serializeOrderItem(item: OrderWithItems['items'][number]) {
  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    priceAtOrder: item.priceAtOrder.toString(),
    productName: item.productName,
    variantTitle: item.variantTitle,
    imageUrl: getItemImageUrl(item),
  };
}

export function serializeOrder(
  order: OrderWithItems | AdminOrderWithItems,
  options: { includeUser?: boolean } = {}
) {
  const subtotal = getSubtotal(order.items);
  const discount = Number(order.discountAmount ?? 0);

  return {
    id: order.id,
    userId: order.userId,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentTxnId: order.paymentTxnId,
    paymentRef: order.paymentRef,
    paidAt: order.paidAt?.toISOString() ?? null,
    couponCode: order.couponCode,
    trackingId: order.trackingId,
    totalAmount: order.totalAmount.toString(),
    subtotal: subtotal.toFixed(2),
    platformFee: ORDER_PLATFORM_FEE.toFixed(2),
    shippingCharge: ORDER_STANDARD_SHIPPING.toFixed(2),
    discount: discount.toFixed(2),
    shippingAddress: order.shippingAddress,
    contactPhone: order.contactPhone,
    cancelReason: order.cancelReason,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(serializeOrderItem),
    ...(options.includeUser && 'user' in order && order.user
      ? { user: serializeUserSummary(order.user) }
      : {}),
  };
}

export function serializeCheckoutQuote(subtotal: number, discount = 0) {
  const total = calculateOrderTotal(subtotal, discount);
  return {
    subtotal: subtotal.toFixed(2),
    platformFee: ORDER_PLATFORM_FEE.toFixed(2),
    shippingCharge: ORDER_STANDARD_SHIPPING.toFixed(2),
    discount: discount.toFixed(2),
    totalAmount: total.toFixed(2),
  };
}
