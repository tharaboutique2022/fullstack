import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/errorHandler';
import * as couponController from './coupon.controller';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from './coupon.validation';

const router = Router();

router.post('/validate', authenticate, validate(validateCouponSchema), couponController.validateCoupon);

const adminRouter = Router();
adminRouter.get('/', couponController.listCoupons);
adminRouter.post('/', validate(createCouponSchema), couponController.createCoupon);
adminRouter.patch('/:id', validate(updateCouponSchema), couponController.updateCoupon);

export { router as couponRouter, adminRouter as couponAdminRouter };
