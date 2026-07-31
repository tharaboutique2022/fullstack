import type { CouponValidationResult } from '@ecomm/shared/api.types';
import { request } from '@/lib/apiClient';

export const couponsApi = {
  validate: (code: string, subtotal: string) =>
    request<CouponValidationResult>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
};
