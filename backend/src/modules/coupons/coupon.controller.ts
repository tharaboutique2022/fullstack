import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getRouteParam } from '../../utils/routeParams';
import { getValidatedBody } from '../../utils/validatedRequest';
import * as couponService from './coupon.service';
import type { ValidateCouponInput } from './coupon.validation';

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const input = getValidatedBody<ValidateCouponInput>(req);
  const result = await couponService.validateCouponCode(input.code, input.subtotal);
  sendSuccess(res, result, 'Coupon applied');
});

export const listCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await couponService.listCoupons();
  sendSuccess(res, coupons);
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.createCoupon(getValidatedBody(req));
  sendSuccess(res, coupon, 'Coupon created', 201);
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.updateCoupon(getRouteParam(req.params.id), getValidatedBody(req));
  sendSuccess(res, coupon, 'Coupon updated');
});
