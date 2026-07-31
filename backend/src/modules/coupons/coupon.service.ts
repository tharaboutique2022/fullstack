import type { Coupon } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../config/prisma';

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
  const minOrder = Number(coupon.minOrderAmount);
  if (subtotal < minOrder) {
    throw AppError.badRequest(`Minimum order amount for this coupon is ₹${minOrder.toFixed(2)}`);
  }

  const raw =
    coupon.discountType === 'percent'
      ? (subtotal * Number(coupon.discountValue)) / 100
      : Number(coupon.discountValue);

  return Math.min(Math.max(raw, 0), subtotal);
}

export async function validateCouponCode(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: code.trim().toUpperCase(),
      isActive: true,
    },
  });

  if (!coupon) {
    throw AppError.badRequest('Invalid coupon code');
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw AppError.badRequest('This coupon has expired');
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw AppError.badRequest('This coupon has reached its usage limit');
  }

  const discountAmount = calculateCouponDiscount(coupon, subtotal);

  return {
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue.toString(),
    discountAmount: discountAmount.toFixed(2),
  };
}

export async function incrementCouponUsage(code: string) {
  await prisma.coupon.updateMany({
    where: { code: code.trim().toUpperCase() },
    data: { usedCount: { increment: 1 } },
  });
}

export async function listCoupons() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return coupons.map(serializeCoupon);
}

export async function createCoupon(data: {
  code: string;
  description?: string | null;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  isActive?: boolean;
}) {
  const coupon = await prisma.coupon.create({
    data: {
      code: data.code.trim().toUpperCase(),
      description: data.description ?? null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount ?? 0,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive ?? true,
    },
  });
  return serializeCoupon(coupon);
}

export async function updateCoupon(
  id: string,
  data: Partial<{
    description: string | null;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxUses: number | null;
    expiresAt: string | null;
    isActive: boolean;
  }>
) {
  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...data,
      expiresAt:
        data.expiresAt === undefined ? undefined : data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  return serializeCoupon(coupon);
}

function serializeCoupon(coupon: Coupon) {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue.toString(),
    minOrderAmount: coupon.minOrderAmount.toString(),
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
  };
}
