import { AppError } from '../../errors/AppError';
import { formatAddress } from '@ecomm/shared';
import { resolveOrderAddress } from '../addresses/address.service';
import { prisma } from '../../config/prisma';
import { generateOrderNumber } from '../../utils/helpers';
import { cartInclude } from '../cart/cart.serializer';
import { calculateCouponDiscount, incrementCouponUsage, validateCouponCode } from '../coupons/coupon.service';
import { createRazorpayRefund } from '../payments/razorpay.service';
import { notifyOrderUpdate } from '../../services/notification.service';
import { calculateOrderTotal } from './order.constants';
import type { CreateOrderInput, CancelOrderInput, ListAdminOrdersQuery, UpdateOrderStatusInput } from './order.validation';
import { orderInclude, orderAdminInclude, serializeCheckoutQuote, serializeOrder } from './order.serializer';

function getLineUnitPrice(item: {
  product: { price: { toString(): string }; hasVariants: boolean; stockStatus: string; isActive: boolean };
  variant: { price: { toString(): string }; stockStatus: string; isActive: boolean } | null;
}): number {
  if (item.variant) {
    return Number(item.variant.price);
  }
  return Number(item.product.price);
}

function isLineAvailable(item: {
  product: { hasVariants: boolean; stockStatus: string; isActive: boolean };
  variant: { stockStatus: string; isActive: boolean } | null;
}): boolean {
  if (!item.product.isActive) return false;
  if (item.product.hasVariants) {
    return !!item.variant?.isActive && item.variant.stockStatus === 'in_stock';
  }
  return item.product.stockStatus === 'in_stock';
}

function getVariantTitle(item: {
  variant: {
    optionValues: Array<{
      optionValue: { value: string; option: { name: string } };
    }>;
  } | null;
}): string | null {
  if (!item.variant) return null;
  return item.variant.optionValues
    .map((link) => link.optionValue.value)
    .join(' / ');
}

async function fetchUserCart(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });
}

export async function getCheckoutQuote(userId: string, couponCode?: string) {
  const cart = await fetchUserCart(userId);

  if (!cart?.items.length) {
    throw AppError.badRequest('Cart is empty');
  }

  const unavailable = cart.items.filter((item) => !isLineAvailable(item));
  if (unavailable.length) {
    throw AppError.badRequest('Some cart items are unavailable. Update your cart before checkout.');
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + getLineUnitPrice(item) * item.quantity,
    0
  );

  let discount = 0;
  let appliedCoupon: string | null = null;

  if (couponCode?.trim()) {
    const coupon = await validateCouponCode(couponCode, subtotal);
    discount = Number(coupon.discountAmount);
    appliedCoupon = coupon.code;
  }

  return {
    ...serializeCheckoutQuote(subtotal, discount),
    couponCode: appliedCoupon,
  };
}

export async function listOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });

  return orders.map((order) => serializeOrder(order));
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  return serializeOrder(order);
}

export async function createOrderFromCart(userId: string, input: CreateOrderInput) {
  const cart = await fetchUserCart(userId);

  if (!cart?.items.length) {
    throw AppError.badRequest('Cart is empty');
  }

  const unavailable = cart.items.filter((item) => !isLineAvailable(item));
  if (unavailable.length) {
    throw AppError.badRequest('Some cart items are unavailable. Update your cart before checkout.');
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + getLineUnitPrice(item) * item.quantity,
    0
  );

  let discount = 0;
  let couponCode: string | null = null;

  if (input.couponCode?.trim()) {
    const coupon = await validateCouponCode(input.couponCode, subtotal);
    discount = Number(coupon.discountAmount);
    couponCode = coupon.code;
  }

  const totalAmount = calculateOrderTotal(subtotal, discount);
  const deliveryAddress = await resolveOrderAddress(userId, input.addressId);
  const shippingAddress = formatAddress(deliveryAddress);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        orderNumber: generateOrderNumber(),
        status: 'pending',
        paymentMethod: 'online',
        couponCode,
        discountAmount: discount,
        totalAmount,
        shippingAddress,
        contactPhone: input.contactPhone,
        notes: input.notes ?? null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            priceAtOrder: getLineUnitPrice(item),
            productName: item.product.name,
            variantTitle: getVariantTitle(item),
          })),
        },
      },
      include: orderInclude,
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    const user = await tx.user.findUnique({ where: { id: userId }, select: { phone: true } });
    if (user && !user.phone) {
      await tx.user.update({
        where: { id: userId },
        data: { phone: input.contactPhone },
      });
    }

    return created;
  });

  if (couponCode) {
    await incrementCouponUsage(couponCode);
  }

  return serializeOrder(order);
}

export async function listAdminOrders(query: ListAdminOrdersQuery) {
  const { page, limit, status } = query;
  const where = status ? { status } : {};

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderAdminInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items: rows.map((row) => serializeOrder(row, { includeUser: true })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getAdminOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderAdminInclude,
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  return serializeOrder(order, { includeUser: true });
}

export async function updateOrderStatus(orderId: string, input: UpdateOrderStatusInput) {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!existing) {
    throw AppError.notFound('Order not found');
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: input.status,
      ...(input.trackingId !== undefined ? { trackingId: input.trackingId } : {}),
    },
    include: orderAdminInclude,
  });

  const statusMessage =
    input.status === 'shipped'
      ? `Your order ${order.orderNumber} has been shipped${input.trackingId ? ` (Tracking: ${input.trackingId})` : ''}.`
      : `Your order ${order.orderNumber} status is now ${input.status}.`;

  void notifyOrderUpdate(
    existing.user.id,
    existing.user.email,
    order.orderNumber,
    `Order ${order.orderNumber} updated`,
    statusMessage,
    order.id
  );

  return serializeOrder(order, { includeUser: true });
}

const USER_CANCELLABLE_ORDER_STATUSES = new Set(['pending', 'confirmed', 'processing']);

async function refundPaidOrder(order: { id: string; paymentRef: string | null; totalAmount: { toString(): string } }) {
  if (!order.paymentRef) return;
  try {
    await createRazorpayRefund(order.paymentRef, Number(order.totalAmount));
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'refunded' },
    });
  } catch {
    // Refund may fail in test mode without captured payment — order still cancelled
  }
}

export async function cancelOrderByUser(userId: string, orderId: string, input: CancelOrderInput) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { user: { select: { email: true } } },
  });

  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (!USER_CANCELLABLE_ORDER_STATUSES.has(order.status)) {
    throw AppError.badRequest('This order can no longer be cancelled');
  }

  if (order.paymentStatus === 'paid') {
    await refundPaidOrder(order);
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'cancelled',
      cancelReason: input.reason,
    },
    include: orderInclude,
  });

  void notifyOrderUpdate(
    userId,
    order.user.email,
    order.orderNumber,
    `Order ${order.orderNumber} cancelled`,
    `Your order ${order.orderNumber} was cancelled.`,
    order.id
  );

  return serializeOrder(updated);
}
