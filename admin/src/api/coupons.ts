import type { Coupon } from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export interface CreateCouponInput {
  code: string;
  description?: string | null;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number | null;
  isActive?: boolean;
}

export const couponsApi = {
  list: () => request<Coupon[]>('/api/admin/coupons'),
  create: (body: CreateCouponInput) =>
    request<Coupon>('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
